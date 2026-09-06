-- The lost-item owner's answers to the ownership-verification questions,
-- submitted for the found-item owner to review against what they actually
-- know about the object (see item_secrets and items.brand on their side).
create table public.match_verifications (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches (id) on delete cascade,
  submitted_by uuid not null references auth.users (id) on delete cascade,
  brand_answer text,
  detail_answer text,
  created_at timestamptz not null default now()
);

create index match_verifications_match_id_idx on public.match_verifications (match_id);

alter table public.match_verifications enable row level security;

create policy "Match participants can view verification answers"
  on public.match_verifications for select
  to authenticated
  using (
    exists (
      select 1 from public.matches
      join public.items li on li.id = matches.lost_item_id
      join public.items fi on fi.id = matches.found_item_id
      where matches.id = match_verifications.match_id
        and (li.user_id = auth.uid() or fi.user_id = auth.uid())
    )
  );

create policy "Match participants can submit verification answers"
  on public.match_verifications for insert
  to authenticated
  with check (
    auth.uid() = submitted_by
    and exists (
      select 1 from public.matches
      join public.items li on li.id = matches.lost_item_id
      join public.items fi on fi.id = matches.found_item_id
      where matches.id = match_verifications.match_id
        and (li.user_id = auth.uid() or fi.user_id = auth.uid())
    )
  );

-- Chat needs each side of a match to see the other participant's display
-- name. profiles already has an owner-only select policy from the earlier
-- migration; this adds a second one (Postgres OR's policies together) so a
-- user can also see the profile of whoever they're matched with — nothing
-- broader than that.
create policy "Match participants can view each other's basic profile"
  on public.profiles for select
  to authenticated
  using (
    exists (
      select 1 from public.matches
      join public.items li on li.id = matches.lost_item_id
      join public.items fi on fi.id = matches.found_item_id
      where (li.user_id = auth.uid() and fi.user_id = profiles.id)
         or (fi.user_id = auth.uid() and li.user_id = profiles.id)
    )
  );
