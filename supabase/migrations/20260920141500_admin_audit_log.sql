-- Tracks every sensitive action taken from the objely-admin portal (user
-- suspension, match arbitration, report resolution, support closure, admin
-- account changes) so there's a real accountability trail. Only ever
-- written/read with the service_role key, same as admin_users — no RLS
-- policies granted, so it stays unreachable from the public app.
create table public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references public.admin_users (id) on delete set null,
  admin_email text not null,
  action text not null,
  target_type text not null,
  target_id text,
  details jsonb,
  created_at timestamptz not null default now()
);

create index admin_audit_log_created_at_idx on public.admin_audit_log (created_at desc);

alter table public.admin_audit_log enable row level security;
