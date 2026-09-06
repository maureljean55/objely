create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null,
  title text not null,
  body text not null,
  match_id uuid references public.matches (id) on delete cascade,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index notifications_user_id_idx on public.notifications (user_id, created_at desc);

alter table public.notifications enable row level security;

create policy "Users can view their own notifications"
  on public.notifications for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can mark their own notifications read"
  on public.notifications for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- A user can insert a notification for either side of a match they're part
-- of (needed so that confirming/resolving a match, or sending a message, can
-- notify the OTHER participant, not just yourself). Always tied to a real
-- match — no way to notify an arbitrary stranger.
create policy "Match participants can notify each other"
  on public.notifications for insert
  to authenticated
  with check (
    match_id is not null
    and exists (
      select 1 from public.matches
      join public.items li on li.id = matches.lost_item_id
      join public.items fi on fi.id = matches.found_item_id
      where matches.id = notifications.match_id
        and (li.user_id = auth.uid() or fi.user_id = auth.uid())
        and (notifications.user_id = li.user_id or notifications.user_id = fi.user_id)
    )
  );
