-- Optional identity verification: a user can submit a photo of an ID
-- document to earn a "verified" badge (the checkmark next to the name on
-- the profile page, previously always shown regardless of any real check)
-- and a trust score bonus. Review is manual, by an admin, on the same
-- service-role-bypasses-RLS pattern as problem_reports — there is no public
-- "admin can read everyone's rows" policy because there is no admin role
-- inside Supabase Auth at all (see admin_users / 20260920120000_admin_users.sql).

alter table public.profiles
  add column identity_verified_at timestamptz;

create table public.identity_verifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  document_path text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  rejection_reason text,
  reviewed_at timestamptz,
  reviewed_by text,
  created_at timestamptz not null default now()
);

create index identity_verifications_user_idx on public.identity_verifications (user_id);

-- One outstanding submission at a time: stops a user from spamming new
-- documents while a review is already pending. A rejected or approved row
-- doesn't block a fresh submission (resubmitting after a rejection, or
-- nothing at all once approved — the UI hides the form in that case).
create unique index identity_verifications_one_pending_per_user
  on public.identity_verifications (user_id)
  where status = 'pending';

alter table public.identity_verifications enable row level security;

create policy "Users can submit their own identity verification"
  on public.identity_verifications for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "Users can view their own identity verification"
  on public.identity_verifications for select
  to authenticated
  using (user_id = auth.uid());

-- Private bucket (the project's other buckets — avatars, item-photos, etc. —
-- are all public: true, which is wrong for a government ID). Only the
-- owner can read/write their own folder; the admin portal never gets a
-- signed cookie/JWT for this bucket, it reads via the service-role key
-- instead, which bypasses storage RLS entirely.
insert into storage.buckets (id, name, public)
values ('identity-documents', 'identity-documents', false);

create policy "Users can upload their own identity document"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'identity-documents' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can view their own identity document"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'identity-documents' and (storage.foldername(name))[1] = auth.uid()::text);

-- Admin-only, atomic approve/reject. Granted to service_role alone (not
-- authenticated) since the caller is always the admin portal's
-- service-role client (src/lib/admin/supabaseAdmin.ts) — a regular
-- logged-in user has no way to invoke these.
create function public.approve_identity_verification(p_verification_id uuid, p_reviewer text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
begin
  update public.identity_verifications
  set status = 'approved', reviewed_at = now(), reviewed_by = p_reviewer
  where id = p_verification_id and status = 'pending'
  returning user_id into v_user_id;

  if v_user_id is null then
    raise exception 'Verification not found or already reviewed';
  end if;

  update public.profiles
  set identity_verified_at = now(), trust_score = least(trust_score + 15, 100)
  where id = v_user_id;
end;
$$;

revoke all on function public.approve_identity_verification(uuid, text) from public;
grant execute on function public.approve_identity_verification(uuid, text) to service_role;

create function public.reject_identity_verification(p_verification_id uuid, p_reviewer text, p_reason text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.identity_verifications
  set status = 'rejected', reviewed_at = now(), reviewed_by = p_reviewer, rejection_reason = p_reason
  where id = p_verification_id and status = 'pending';

  if not found then
    raise exception 'Verification not found or already reviewed';
  end if;
end;
$$;

revoke all on function public.reject_identity_verification(uuid, text, text) from public;
grant execute on function public.reject_identity_verification(uuid, text, text) to service_role;
