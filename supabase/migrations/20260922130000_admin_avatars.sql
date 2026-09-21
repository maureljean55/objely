-- Lets an admin (objely-admin portal) upload a profile photo. Uploads only
-- ever go through the admin app's service-role client (there's no
-- Supabase Auth session for admin_users to scope a storage RLS policy to),
-- so the bucket just needs to be public for reads — no storage policies
-- are needed since the service role bypasses RLS entirely on writes.
alter table public.admin_users
  add column avatar_url text;

insert into storage.buckets (id, name, public)
values ('admin-avatars', 'admin-avatars', true);
