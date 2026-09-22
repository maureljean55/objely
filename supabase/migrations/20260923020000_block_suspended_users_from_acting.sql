-- Residual gap flagged during penetration testing: the app's suspended-
-- account screen (src/lib/supabase/middleware.ts) blocks navigation, but
-- Supabase Auth's ban only stops the *next* sign-in/token refresh — a
-- session issued before the ban stays cryptographically valid (and RLS
-- doesn't otherwise check suspension) until it naturally expires, up to an
-- hour by default. During that window a suspended user could still create
-- declarations or message people directly via the API, bypassing the UI
-- entirely. This adds an explicit suspension check to every write path that
-- lets a user act on/toward other people — the actions a suspension is
-- actually meant to stop.

create function public.is_suspended(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles where id = p_user_id and suspended_at is not null);
$$;

revoke all on function public.is_suspended(uuid) from public, anon;
grant execute on function public.is_suspended(uuid) to authenticated;

-- items: extend the existing insert policy.
drop policy "Users can insert their own items" on public.items;

create policy "Users can insert their own items"
  on public.items for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and public.user_items_created_in_last_24h(auth.uid()) < 2
    and exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.identity_verified_at is not null
    )
    and not public.is_suspended(auth.uid())
  );

-- messages (match chat): extend the existing insert policy.
drop policy "Confirmed match participants can send messages" on public.messages;

create policy "Confirmed match participants can send messages"
  on public.messages for insert
  to authenticated
  with check (
    auth.uid() = sender_id
    and not public.is_suspended(auth.uid())
    and exists (
      select 1 from public.matches
      join public.items li on li.id = matches.lost_item_id
      join public.items fi on fi.id = matches.found_item_id
      where matches.id = messages.match_id
        and matches.status = 'confirmed'
        and matches.chat_closed_at is null
        and (li.user_id = auth.uid() or fi.user_id = auth.uid())
    )
  );

-- send_direct_message: add a check at the top of the function body.
create or replace function public.send_direct_message(
  p_conversation_id uuid,
  p_body text default null,
  p_voice_url text default null,
  p_reply_to_id uuid default null,
  p_attachment_url text default null,
  p_attachment_name text default null,
  p_attachment_type text default null
)
returns public.direct_messages
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := auth.uid();
  conv public.direct_conversations;
  other_id uuid;
  new_message public.direct_messages;
  msg_kind text;
  notif_body text;
begin
  if me is null then
    raise exception 'Not authenticated';
  end if;

  if public.is_suspended(me) then
    raise exception 'Account is suspended';
  end if;

  if p_voice_url is not null then
    msg_kind := 'voice';
    notif_body := 'Note vocale';
  elsif p_attachment_url is not null then
    msg_kind := 'attachment';
    notif_body := coalesce(p_attachment_name, 'Pièce jointe');
  else
    if p_body is null or length(trim(p_body)) = 0 then
      raise exception 'Message body cannot be empty';
    end if;
    msg_kind := 'text';
    notif_body := left(p_body, 120);
  end if;

  select * into conv from public.direct_conversations where id = p_conversation_id;
  if conv is null or (conv.user_a <> me and conv.user_b <> me) then
    raise exception 'Not a participant of this conversation';
  end if;

  if p_reply_to_id is not null and not exists (
    select 1 from public.direct_messages where id = p_reply_to_id and conversation_id = p_conversation_id
  ) then
    raise exception 'Reply target is not part of this conversation';
  end if;

  insert into public.direct_messages (
    conversation_id, sender_id, body, kind, voice_url, reply_to_id, attachment_url, attachment_name, attachment_type
  )
  values (
    p_conversation_id, me, p_body, msg_kind, p_voice_url, p_reply_to_id, p_attachment_url, p_attachment_name, p_attachment_type
  )
  returning * into new_message;

  other_id := case when conv.user_a = me then conv.user_b else conv.user_a end;

  if conv.deleted_by_a_at is not null or conv.deleted_by_b_at is not null then
    update public.direct_conversations
    set deleted_by_a_at = null, deleted_by_b_at = null
    where id = p_conversation_id;
  end if;

  insert into public.notifications (user_id, type, title, body, direct_conversation_id)
  values (other_id, 'message', 'Nouveau message', notif_body, p_conversation_id);

  return new_message;
end;
$$;

revoke all on function public.send_direct_message(uuid, text, text, uuid, text, text, text) from public;
grant execute on function public.send_direct_message(uuid, text, text, uuid, text, text, text) to authenticated;

-- send_community_message: add a check at the top of the function body.
create or replace function public.send_community_message(
  p_community_id uuid,
  p_body text,
  p_reply_to_id uuid default null
)
returns public.community_messages
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := auth.uid();
  new_message public.community_messages;
begin
  if me is null then
    raise exception 'Not authenticated';
  end if;
  if public.is_suspended(me) then
    raise exception 'Account is suspended';
  end if;
  if not public.is_community_member(p_community_id) then
    raise exception 'Not a member of this community';
  end if;
  if length(trim(coalesce(p_body, ''))) = 0 then
    raise exception 'Message body cannot be empty';
  end if;
  if length(p_body) > 4000 then
    raise exception 'Message is too long';
  end if;
  if p_reply_to_id is not null and not exists (
    select 1 from public.community_messages where id = p_reply_to_id and community_id = p_community_id
  ) then
    raise exception 'Reply target is not part of this community';
  end if;

  insert into public.community_messages (community_id, sender_id, body, reply_to_id)
  values (p_community_id, me, p_body, p_reply_to_id)
  returning * into new_message;

  return new_message;
end;
$$;

revoke all on function public.send_community_message(uuid, text, uuid) from public, anon;
grant execute on function public.send_community_message(uuid, text, uuid) to authenticated;
