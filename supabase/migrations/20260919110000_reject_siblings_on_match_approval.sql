-- Functional bug (match-to-restitution audit): a found item can have
-- several pending matches at once (up to 5 distinct claimants, per
-- 20260918110000_cap_verifications_per_found_item.sql, whose own comment
-- already says "the finder should resolve the pending ones first" — implying
-- only one is meant to end up confirmed). But resolve_match only checked
-- the status of the ONE match being resolved, never whether a sibling match
-- on the same found_item_id was already confirmed. A finder approving two
-- different claimants' matches for the same physical object in sequence hit
-- nothing blocking it — unlocking two independent chats and two independent
-- restitution flows for one object.
--
-- Fix: when a match is approved, auto-reject every other still-pending
-- match on the same found item (mirroring the existing reject behavior:
-- their lost item reverts to "searching"), and notify each affected
-- claimant — same as if the finder had rejected them individually.

create or replace function public.resolve_match(p_match_id uuid, p_approved boolean)
returns public.matches
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := auth.uid();
  m public.matches;
  updated public.matches;
  sibling record;
begin
  if me is null then
    raise exception 'Not authenticated';
  end if;

  select * into m from public.matches where id = p_match_id;
  if m is null then
    raise exception 'Match not found';
  end if;

  if m.status <> 'pending' then
    raise exception 'Match is not pending';
  end if;

  if p_approved then
    if not exists (select 1 from public.items where id = m.found_item_id and user_id = me) then
      raise exception 'Only the finder can approve this match';
    end if;
    if not public.match_has_verification(p_match_id) then
      raise exception 'No verification submitted yet';
    end if;
  else
    if not exists (select 1 from public.items where id in (m.lost_item_id, m.found_item_id) and user_id = me) then
      raise exception 'Not a participant of this match';
    end if;
  end if;

  update public.matches
  set status = case when p_approved then 'confirmed' else 'rejected' end::public.match_status
  where id = p_match_id
  returning * into updated;

  if not p_approved then
    update public.items set status = 'searching' where id in (m.lost_item_id, m.found_item_id);
  else
    for sibling in
      select id, lost_item_id from public.matches
      where found_item_id = m.found_item_id and id <> p_match_id and status = 'pending'
    loop
      update public.matches set status = 'rejected' where id = sibling.id;
      update public.items set status = 'searching' where id = sibling.lost_item_id;
      perform public.notify_match_participant(sibling.id, 'verification_rejected');
    end loop;
  end if;

  return updated;
end;
$$;
