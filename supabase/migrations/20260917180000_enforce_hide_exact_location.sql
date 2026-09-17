-- Security fix (matching-feature audit, part 2): the found-item flow shows a
-- "Masquer l'emplacement exact" toggle (default ON) promising that "only an
-- approximate perimeter will be communicated to the person searching for
-- their object, preserving your privacy until the meeting" — but the
-- resulting hide_exact_location flag was never actually enforced anywhere.
-- The items SELECT policy ("viewable by any authenticated user", plus an
-- anon policy for found items) always returned the raw, exact `location`
-- text, rendered verbatim on the public home feed, search, item detail and
-- pre-match candidate pages — before any match or verification exists, and
-- even to unauthenticated visitors.
--
-- This adds a genuine coarse location (`location_public`, populated by the
-- app at declaration time from reverse-geocoded address components — see
-- src/app/report-found/location/page.tsx) and a view that serves the
-- coarse value instead of the exact one to anyone who isn't the item's
-- owner or the confirmed counterpart of a match on that item. The exact
-- `location` column and the base `items` table are untouched — matching
-- (which needs full precision) keeps reading them directly server-side.

alter table public.items add column location_public text;

-- security_invoker is required: without it a view runs with the *creating*
-- role's privileges, which would silently bypass the underlying items RLS
-- entirely instead of evaluating it for the querying user.
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
  case
    when not i.hide_exact_location then i.location
    when auth.uid() = i.user_id then i.location
    when exists (
      select 1 from public.matches m
      where m.status = 'confirmed'
        and (
          (m.found_item_id = i.id and exists (
            select 1 from public.items li where li.id = m.lost_item_id and li.user_id = auth.uid()
          ))
          or
          (m.lost_item_id = i.id and exists (
            select 1 from public.items fi where fi.id = m.found_item_id and fi.user_id = auth.uid()
          ))
        )
    ) then i.location
    else coalesce(i.location_public, 'Zone approximative non précisée')
  end as location,
  i.hide_exact_location,
  i.photos,
  i.occurred_on,
  i.deleted_at,
  i.resolved_before_deletion,
  i.deletion_reason,
  i.created_at,
  i.updated_at
from public.items i;

grant select on public.items_public to authenticated, anon;
