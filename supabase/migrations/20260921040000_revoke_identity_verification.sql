-- Lets an admin undo an approval — either a misclick or a detail noticed
-- after the fact. Puts the submission back to "pending" (so it reappears in
-- the review queue instead of just vanishing) and reverses the badge and
-- the trust score bonus it granted. Symmetrical to
-- approve_identity_verification (20260921020000_identity_verification.sql).

create function public.revoke_identity_verification(p_verification_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
begin
  update public.identity_verifications
  set status = 'pending', reviewed_at = null, reviewed_by = null, rejection_reason = null
  where id = p_verification_id and status = 'approved'
  returning user_id into v_user_id;

  if v_user_id is null then
    raise exception 'Verification not found or not approved';
  end if;

  update public.profiles
  set identity_verified_at = null, trust_score = greatest(trust_score - 15, 0)
  where id = v_user_id;
end;
$$;

revoke all on function public.revoke_identity_verification(uuid) from public;
grant execute on function public.revoke_identity_verification(uuid) to service_role;
