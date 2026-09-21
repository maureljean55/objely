-- Lets either side of a direct conversation (QR-scan messaging, not a
-- lost/found match chat — those already have close_chat) remove it from
-- their own inbox. This is a per-side hide, not a hard delete: the other
-- participant keeps seeing their copy, and message history isn't touched.
-- If either side sends a new message afterwards, the conversation
-- reappears for both — same "delete just clears it until new activity"
-- behavior as most messaging apps, so a hidden conversation can't silently
-- swallow a message the other person is still waiting on a reply to.

alter table public.direct_conversations
  add column deleted_by_a_at timestamptz,
  add column deleted_by_b_at timestamptz;

create or replace function public.delete_direct_conversation(p_conversation_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := auth.uid();
  conv public.direct_conversations;
begin
  if me is null then
    raise exception 'Not authenticated';
  end if;

  select * into conv from public.direct_conversations where id = p_conversation_id;
  if conv is null or (conv.user_a <> me and conv.user_b <> me) then
    raise exception 'Not a participant of this conversation';
  end if;

  if conv.user_a = me then
    update public.direct_conversations set deleted_by_a_at = now() where id = p_conversation_id;
  else
    update public.direct_conversations set deleted_by_b_at = now() where id = p_conversation_id;
  end if;
end;
$$;

revoke all on function public.delete_direct_conversation(uuid) from public;
grant execute on function public.delete_direct_conversation(uuid) to authenticated;

-- Re-create with the hide filter for the caller's side.
drop function if exists public.list_my_direct_conversations();

create or replace function public.list_my_direct_conversations()
returns table (
  conversation_id uuid,
  other_user_id uuid,
  other_full_name text,
  other_avatar_url text,
  last_message_body text,
  last_message_kind text,
  last_message_deleted_at timestamptz,
  last_message_sender_id uuid,
  last_message_created_at timestamptz
)
language sql
security definer
set search_path = public
stable
as $$
  select
    dc.id as conversation_id,
    other.id as other_user_id,
    other.full_name as other_full_name,
    other.avatar_url as other_avatar_url,
    lm.body as last_message_body,
    lm.kind as last_message_kind,
    lm.deleted_at as last_message_deleted_at,
    lm.sender_id as last_message_sender_id,
    lm.created_at as last_message_created_at
  from public.direct_conversations dc
  join public.profiles other on other.id = (case when dc.user_a = auth.uid() then dc.user_b else dc.user_a end)
  left join lateral (
    select body, kind, deleted_at, sender_id, created_at
    from public.direct_messages dm
    where dm.conversation_id = dc.id
    order by dm.created_at desc
    limit 1
  ) lm on true
  where (dc.user_a = auth.uid() or dc.user_b = auth.uid())
    and (case when dc.user_a = auth.uid() then dc.deleted_by_a_at else dc.deleted_by_b_at end) is null
  order by coalesce(lm.created_at, dc.created_at) desc;
$$;

revoke all on function public.list_my_direct_conversations() from public;
grant execute on function public.list_my_direct_conversations() to authenticated;

-- A fresh message clears any hide on both sides, so the conversation isn't
-- stuck invisible to someone who just deleted it and then got (or sent) a
-- reply.
drop function if exists public.send_direct_message(uuid, text, text, uuid);

create or replace function public.send_direct_message(
  p_conversation_id uuid,
  p_body text default null,
  p_voice_url text default null,
  p_reply_to_id uuid default null
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

  if p_voice_url is not null then
    msg_kind := 'voice';
    notif_body := 'Note vocale';
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

  insert into public.direct_messages (conversation_id, sender_id, body, kind, voice_url, reply_to_id)
  values (p_conversation_id, me, p_body, msg_kind, p_voice_url, p_reply_to_id)
  returning * into new_message;

  if conv.deleted_by_a_at is not null or conv.deleted_by_b_at is not null then
    update public.direct_conversations
    set deleted_by_a_at = null, deleted_by_b_at = null
    where id = p_conversation_id;
  end if;

  other_id := case when conv.user_a = me then conv.user_b else conv.user_a end;

  insert into public.notifications (user_id, type, title, body, direct_conversation_id)
  values (other_id, 'message', 'Nouveau message', notif_body, p_conversation_id);

  return new_message;
end;
$$;

revoke all on function public.send_direct_message(uuid, text, text, uuid) from public;
grant execute on function public.send_direct_message(uuid, text, text, uuid) to authenticated;
