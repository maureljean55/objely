-- Backs the separate objely-admin portal's own login (never the same
-- credentials as regular app users). Only ever read/written with the
-- service_role key from the admin app's server side, so no RLS policies are
-- granted to anon/authenticated — the default-deny behavior once RLS is on
-- keeps this table completely unreachable from the public app and its API
-- keys.
create table public.admin_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  full_name text not null,
  role text not null default 'admin' check (role in ('admin', 'super_admin')),
  created_at timestamptz not null default now(),
  last_login_at timestamptz
);

alter table public.admin_users enable row level security;
