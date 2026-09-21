-- Real page-view analytics for the admin portal: which pages get visited,
-- how many visits per day, and at what hours. Recorded server-side from
-- proxy.ts on (almost) every navigation — see src/proxy.ts and
-- src/lib/supabase/middleware.ts for the write path.

create table public.page_views (
  id uuid primary key default gen_random_uuid(),
  path text not null,
  user_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index page_views_created_at_idx on public.page_views (created_at);
create index page_views_path_idx on public.page_views (path);

alter table public.page_views enable row level security;

-- This is a fire-and-forget analytics beacon written from the server, not a
-- security boundary — like any page-view pixel, a determined caller could
-- always inflate a page's count just by visiting it for real. No select
-- policy is defined, so only the admin portal's service-role client
-- (which bypasses RLS entirely) can ever read this table.
create policy "Anyone can record a page view"
  on public.page_views for insert
  to anon, authenticated
  with check (true);
