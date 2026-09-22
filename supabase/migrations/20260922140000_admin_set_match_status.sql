-- Audit finding: the admin portal's "Confirmer/Rejeter/Rouvrir" on
-- /correspondances did a bare `update matches set status = ...`, bypassing
-- everything resolve_match normally does — auto-rejecting sibling pending
-- matches on the same found item, reverting items to 'searching' on
-- rejection, flipping them to 'matched' on confirmation, and notifying both
-- participants. An admin using those buttons could leave the database in
-- exactly the inconsistent states earlier migrations already had to fix for
-- the user-facing flow (e.g. 20260919110000_reject_siblings_on_match_approval.sql).
--
-- This is an admin-only equivalent of resolve_match: same item/sibling side
-- effects, but callable via the service-role client (no auth.uid()), so it
-- skips the "only the finder can approve"/"verification submitted" gates
-- and inserts notifications directly instead of going through
-- notify_match_participant (which requires an authenticated participant).
create function public.admin_set_match_status(p_match_id uuid, p_status text)
returns public.matches
language plpgsql
security definer
set search_path = public
as $$
declare
  m public.matches;
  updated public.matches;
  sibling record;
  lost_title text;
begin
  if p_status not in ('pending', 'confirmed', 'rejected') then
    raise exception 'Invalid status';
  end if;

  select * into m from public.matches where id = p_match_id;
  if m is null then
    raise exception 'Match not found';
  end if;

  select title into lost_title from public.items where id = m.lost_item_id;

  update public.matches set status = p_status::public.match_status where id = p_match_id returning * into updated;

  if p_status = 'confirmed' and m.status <> 'confirmed' then
    update public.items set status = 'matched' where id in (m.lost_item_id, m.found_item_id) and status = 'searching';

    -- Same invariant as resolve_match: only one confirmed match per found
    -- item. Auto-reject every other still-pending claimant and revert
    -- their lost item (the found item itself is left alone — it's already
    -- matched with the winner).
    for sibling in
      select id, lost_item_id from public.matches
      where found_item_id = m.found_item_id and id <> p_match_id and status = 'pending'
    loop
      update public.matches set status = 'rejected' where id = sibling.id;
      update public.items set status = 'searching' where id = sibling.lost_item_id and status = 'matched';
      insert into public.notifications (user_id, type, title, body, match_id)
      select items.user_id, 'verification_rejected', 'Correspondance refusée',
             format('La correspondance pour "%s" a été refusée.', items.title), sibling.id
      from public.items where id = sibling.lost_item_id;
    end loop;

    insert into public.notifications (user_id, type, title, body, match_id)
    select items.user_id, 'verification_confirmed', 'Correspondance confirmée !',
           format('Votre correspondance pour "%s" est confirmée. Discutez avec l''autre partie pour organiser la restitution.', lost_title),
           p_match_id
    from public.items where id in (m.lost_item_id, m.found_item_id);

  elsif p_status = 'rejected' and m.status <> 'rejected' then
    update public.items set status = 'searching' where id in (m.lost_item_id, m.found_item_id) and status = 'matched';

    insert into public.notifications (user_id, type, title, body, match_id)
    select items.user_id, 'verification_rejected', 'Correspondance refusée',
           format('La correspondance pour "%s" a été refusée.', lost_title), p_match_id
    from public.items where id in (m.lost_item_id, m.found_item_id);
  end if;

  -- p_status = 'pending' (reopen): deliberately no item-status/notification
  -- side effects — guessing what the items "should" revert to is riskier
  -- than leaving them as-is until the admin makes an explicit confirm/reject
  -- decision, which will then correctly fix up status on its own.

  return updated;
end;
$$;

revoke all on function public.admin_set_match_status(uuid, text) from public;
grant execute on function public.admin_set_match_status(uuid, text) to service_role;
