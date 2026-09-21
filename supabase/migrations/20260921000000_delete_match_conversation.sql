-- Lets either match participant remove a lost/found conversation from their
-- own inbox, mirroring delete_direct_conversation's per-side hide: the match
-- itself, its items and message history are untouched, and the other side
-- keeps seeing their copy. Uses "lost"/"found" instead of "a"/"b" since a
-- participant's side in a match is fixed, unlike a direct conversation's
-- arbitrary user_a/user_b.

alter table public.matches
  add column deleted_by_lost_user_at timestamptz,
  add column deleted_by_found_user_at timestamptz;

create or replace function public.delete_match_conversation(p_match_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := auth.uid();
  m public.matches;
  is_lost_side boolean;
begin
  if me is null then
    raise exception 'Not authenticated';
  end if;

  select * into m from public.matches where id = p_match_id;
  if m is null then
    raise exception 'Match not found';
  end if;

  if exists (select 1 from public.items where id = m.lost_item_id and user_id = me) then
    is_lost_side := true;
  elsif exists (select 1 from public.items where id = m.found_item_id and user_id = me) then
    is_lost_side := false;
  else
    raise exception 'Not a participant of this match';
  end if;

  if is_lost_side then
    update public.matches set deleted_by_lost_user_at = now() where id = p_match_id;
  else
    update public.matches set deleted_by_found_user_at = now() where id = p_match_id;
  end if;
end;
$$;

revoke all on function public.delete_match_conversation(uuid) from public;
grant execute on function public.delete_match_conversation(uuid) to authenticated;

-- A fresh message clears either side's hide, same "delete just clears it
-- until new activity" rule as delete_direct_conversation, so a hidden
-- conversation can't silently swallow a message the other person is still
-- waiting on a reply to.
create or replace function public.clear_match_conversation_delete_on_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.matches
  set deleted_by_lost_user_at = null, deleted_by_found_user_at = null
  where id = new.match_id
    and (deleted_by_lost_user_at is not null or deleted_by_found_user_at is not null);
  return new;
end;
$$;

drop trigger if exists clear_match_conversation_delete_on_message on public.messages;
create trigger clear_match_conversation_delete_on_message
  after insert on public.messages
  for each row execute function public.clear_match_conversation_delete_on_message();
