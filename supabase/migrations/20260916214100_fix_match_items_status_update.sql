-- Bug found via the same end-to-end test as the resolve_match fix: createMatch
-- (src/lib/supabase/matching.ts) flips both items to 'matched' with a plain
-- client-side `.update({status:'matched'}).in('id', [lostItem.id,
-- foundItem.id])` — under "Users can update their own items" (auth.uid() =
-- user_id), RLS silently drops the row the caller doesn't own. Whichever
-- side's client actually calls createMatch, only THEIR OWN item ever
-- actually flips to 'matched'; the other party's item is silently left at
-- 'searching' for the entire lifetime of the match. Exactly the same
-- silent-partial-update failure mode the restitution_appointments migration
-- already called out and fixed for resolve_match/confirm_restitution — this
-- call site was missed.
create or replace function public.mark_match_items_matched(p_match_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := auth.uid();
  m public.matches;
  li public.items;
  fi public.items;
begin
  if me is null then
    raise exception 'Not authenticated';
  end if;

  select * into m from public.matches where id = p_match_id;
  if m is null then
    raise exception 'Match not found';
  end if;

  select * into li from public.items where id = m.lost_item_id;
  select * into fi from public.items where id = m.found_item_id;

  if li.user_id <> me and fi.user_id <> me then
    raise exception 'Not a participant of this match';
  end if;

  update public.items
  set status = 'matched'::public.item_status
  where id in (m.lost_item_id, m.found_item_id)
    and status = 'searching';
end;
$$;

revoke all on function public.mark_match_items_matched(uuid) from public;
grant execute on function public.mark_match_items_matched(uuid) to authenticated;
