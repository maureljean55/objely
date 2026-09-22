-- CRITICAL SECURITY FIX, found via active penetration testing: every
-- "admin-only" function added this cycle (identity verification
-- approve/reject/revoke, admin_set_match_status, get_analytics_summary)
-- used `revoke all on function ... from public` before granting to
-- service_role — but Supabase's project-level default privileges grant
-- EXECUTE on every new function in `public` directly to the `anon` and
-- `authenticated` roles, not through the PUBLIC pseudo-role. Revoking from
-- PUBLIC never touched that separate, named grant, so ANY logged-in user
-- (and possibly anonymous callers) could call these functions directly via
-- the Supabase client/REST API, completely bypassing the admin portal:
-- approve their own identity verification, force-confirm/reject any match,
-- or read the full analytics summary. Verified exploitable end to end with
-- disposable test accounts before this fix, and confirmed blocked after it.
--
-- Fix: revoke from anon and authenticated explicitly (not just public) on
-- every admin-only function from this session.
revoke all on function public.approve_identity_verification(uuid, text) from public, anon, authenticated;
grant execute on function public.approve_identity_verification(uuid, text) to service_role;

revoke all on function public.reject_identity_verification(uuid, text, text) from public, anon, authenticated;
grant execute on function public.reject_identity_verification(uuid, text, text) to service_role;

revoke all on function public.revoke_identity_verification(uuid) from public, anon, authenticated;
grant execute on function public.revoke_identity_verification(uuid) to service_role;

revoke all on function public.admin_set_match_status(uuid, text) from public, anon, authenticated;
grant execute on function public.admin_set_match_status(uuid, text) to service_role;

revoke all on function public.get_analytics_summary(integer) from public, anon, authenticated;
grant execute on function public.get_analytics_summary(integer) to service_role;
