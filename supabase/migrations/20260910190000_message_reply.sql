-- Swipe-to-reply (quote a message, WhatsApp-style) needs each message to
-- optionally point at the one it's replying to.

alter table public.messages
  add column reply_to_id uuid references public.messages (id) on delete set null;

alter table public.direct_messages
  add column reply_to_id uuid references public.direct_messages (id) on delete set null;

-- send_direct_message gains an optional reply target, alongside the
-- existing optional voice_url.
drop function if exists public.send_direct_message(uuid, text, text);

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

  other_id := case when conv.user_a = me then conv.user_b else conv.user_a end;

  insert into public.notifications (user_id, type, title, body, direct_conversation_id)
  values (other_id, 'message', 'Nouveau message', notif_body, p_conversation_id);

  return new_message;
end;
$$;

revoke all on function public.send_direct_message(uuid, text, text, uuid) from public;
grant execute on function public.send_direct_message(uuid, text, text, uuid) to authenticated;
