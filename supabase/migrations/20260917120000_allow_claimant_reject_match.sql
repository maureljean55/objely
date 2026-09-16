-- resolve_match() has always required the caller to own the found_item,
-- regardless of p_approved — but the UI (activity/match/page.tsx) shows the
-- "Ce n'est pas mon objet" reject button to BOTH participants. When the
-- lost-item owner (claimant) clicked it, the RPC raised "Only the finder can
-- resolve this match" and the client silently swallowed that error and
-- navigated away anyway, leaving the match "pending" while the user believed
-- they had declined it. Approval still requires the finder (it's gated on
-- the finder having reviewed the claimant's verification answers), but
-- rejection is now allowed from either side — either participant can always
-- say "this isn't a match" for their own item.
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
  end if;

  return updated;
end;
$$;

revoke all on function public.resolve_match(uuid, boolean) from public;
grant execute on function public.resolve_match(uuid, boolean) to authenticated;
