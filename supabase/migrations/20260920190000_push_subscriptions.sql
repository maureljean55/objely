-- Stores each device's Web Push subscription so an incoming call (see
-- src/app/api/calls/ring/route.ts) can wake the app even when it's closed
-- or the phone is locked — the Realtime broadcast channel calling already
-- uses only reaches a tab that's actively open and connected.

create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

create index push_subscriptions_user_id_idx on public.push_subscriptions (user_id);

alter table public.push_subscriptions enable row level security;

create policy "Users can view their own push subscriptions"
  on public.push_subscriptions for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own push subscriptions"
  on public.push_subscriptions for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own push subscriptions"
  on public.push_subscriptions for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own push subscriptions"
  on public.push_subscriptions for delete
  to authenticated
  using (auth.uid() = user_id);

-- No client-facing select policy is needed by anyone but the owner: the
-- call-ring route reads across users with the service-role key
-- (src/lib/admin/supabaseAdmin.ts's pattern), which bypasses RLS entirely.
