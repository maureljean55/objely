-- Bug found via an end-to-end test (real two-user match walked through
-- verification -> approval): resolve_match() has always failed with
-- "column status is of type match_status but expression is of type text" —
-- the CASE expression's string literals aren't implicitly cast to the
-- match_status enum in this UPDATE ... SET context. This meant a match
-- could NEVER actually be approved or rejected through the app; the finder's
-- "Confirmer"/"Ce n'est pas mon objet" buttons have been silently broken
-- since this function was introduced (20260914100000). Explicit cast fixes it.
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

  if not exists (select 1 from public.items where id = m.found_item_id and user_id = me) then
    raise exception 'Only the finder can resolve this match';
  end if;

  if p_approved and not public.match_has_verification(p_match_id) then
    raise exception 'No verification submitted yet';
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
