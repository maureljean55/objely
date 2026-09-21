-- Lets the main app detect a suspension cheaply on every request (a plain
-- indexed row read via the user's own RLS-covered profile), without the
-- consumer-facing app needing a service-role client just to poll ban
-- status. The admin portal's existing setUserSuspended action (Supabase
-- Auth's own ban_duration — the real, deep enforcement that also blocks
-- token refresh/sign-in) now also writes these two columns, so the app can
-- show an immediate "your account is suspended" screen instead of waiting
-- for the banned session to eventually fail on its own.
alter table public.profiles
  add column suspended_at timestamptz,
  add column suspended_reason text;
