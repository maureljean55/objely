-- Security fix (matching-feature audit): "Match participants can view each
-- other's basic profile" (20260905233346_match_verifications.sql) granted a
-- full-row SELECT on public.profiles — including phone and address — to
-- anyone who merely appears as a participant on ANY matches row, with no
-- check on matches.status. Creating a matches row is self-service (any
-- authenticated user can read another user's item via the open items SELECT
-- policy, fabricate a matching counterpart item, and insert a matches row
-- once compute_match_score clears the threshold), so this let an attacker
-- read a stranger's phone/address before any ownership verification or
-- confirmation ever happened.
--
-- The only real consumer of this policy is the chat page, which only ever
-- needs full_name/avatar_url for a CONFIRMED match's counterpart (every
-- link to /chat/[matchId] in the app already filters to status = 'confirmed'
-- — see src/lib/supabase/messages.ts's listMatches). Replace the broad
-- table-level policy with a narrow security-definer RPC, mirroring the
-- get_public_profile() pattern already used for the QR flow
-- (20260910150000_qr_public_profile.sql): it returns only name/avatar, and
-- only once the match is genuinely confirmed.

drop policy "Match participants can view each other's basic profile" on public.profiles;

create or replace function public.get_match_participant_profile(p_match_id uuid)
returns table (id uuid, full_name text, avatar_url text)
language sql
security definer
set search_path = public
stable
as $$
  select p.id, p.full_name, p.avatar_url
  from public.matches m
  join public.items li on li.id = m.lost_item_id
  join public.items fi on fi.id = m.found_item_id
  join public.profiles p on p.id = (case when li.user_id = auth.uid() then fi.user_id else li.user_id end)
  where m.id = p_match_id
    and m.status = 'confirmed'
    and (li.user_id = auth.uid() or fi.user_id = auth.uid())
$$;

revoke all on function public.get_match_participant_profile(uuid) from public;
grant execute on function public.get_match_participant_profile(uuid) to authenticated;
