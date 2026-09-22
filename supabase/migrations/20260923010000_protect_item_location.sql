-- CRITICAL SECURITY FIX, found via active penetration testing: the "Masquer
-- l'emplacement exact" feature (hide_exact_location) was only ever enforced
-- in the items_public VIEW's redaction logic (20260917180000). The
-- underlying items table's own SELECT policy ("viewable by any
-- authenticated user") was never restricted, so a client calling
-- `.from("items").select("location")` directly — trivial via the browser's
-- own anon key, bypassing the app's UI entirely, which is exactly what a
-- real attacker would do — read the exact, unredacted location regardless
-- of hide_exact_location. Confirmed exploitable end to end before this fix.
--
-- Mirrors the item_secrets pattern already used elsewhere in this exact
-- schema for the same class of problem (a value that must not ride along
-- with items' broad "anyone can view" policy): move the sensitive value out
-- to its own table with row-level access rules matching items_public's
-- redaction logic exactly, then drop it from items so there is no
-- unprotected copy left to query directly.

create table public.item_locations (
  item_id uuid primary key references public.items (id) on delete cascade,
  location text not null
);

alter table public.item_locations enable row level security;

create policy "Item location follows hide_exact_location visibility rules"
  on public.item_locations for select
  to authenticated, anon
  using (
    exists (
      select 1 from public.items
      where items.id = item_locations.item_id
        and (
          not items.hide_exact_location
          or items.user_id = auth.uid()
          or exists (
            select 1 from public.matches m
            where m.status = 'confirmed'
              and (
                (m.found_item_id = item_locations.item_id and exists (
                  select 1 from public.items li where li.id = m.lost_item_id and li.user_id = auth.uid()
                ))
                or
                (m.lost_item_id = item_locations.item_id and exists (
                  select 1 from public.items fi where fi.id = m.found_item_id and fi.user_id = auth.uid()
                ))
              )
          )
        )
    )
  );

create policy "Item location is only insertable by the item owner"
  on public.item_locations for insert
  to authenticated
  with check (exists (select 1 from public.items where items.id = item_locations.item_id and items.user_id = auth.uid()));

-- Migrate existing data before dropping the column it came from.
insert into public.item_locations (item_id, location)
select id, location from public.items where location is not null
on conflict (item_id) do nothing;

-- Rebuild items_public against the new protected table BEFORE dropping the
-- column — the view currently references items.location directly, so
-- dropping it first would fail with a dependency error. item_locations'
-- own RLS already returns no row for anyone not entitled to it, so a plain
-- left join + coalesce reproduces the exact same redaction the old CASE
-- statement did — just enforced at the row level everywhere, not only in
-- this view.
create or replace view public.items_public
with (security_invoker = true) as
select
  i.id,
  i.user_id,
  i.type,
  i.status,
  i.category_id,
  i.category_label,
  i.category_icon,
  i.title,
  i.description,
  i.brand,
  i.colors,
  coalesce(il.location, i.location_public, 'Zone approximative non précisée') as location,
  i.hide_exact_location,
  i.photos,
  i.occurred_on,
  i.deleted_at,
  i.resolved_before_deletion,
  i.deletion_reason,
  i.created_at,
  i.updated_at
from public.items i
left join public.item_locations il on il.item_id = i.id;

grant select on public.items_public to authenticated, anon;

alter table public.items drop column location;
