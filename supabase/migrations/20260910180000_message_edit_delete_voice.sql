-- Adds three chat capabilities, shared by both message tables (match-based
-- "messages" and QR-based "direct_messages"): editing your own text
-- message, soft-deleting your own message, and sending a voice note
-- instead of text.

alter table public.messages
  alter column body drop not null,
  add column kind text not null default 'text' check (kind in ('text', 'voice')),
  add column voice_url text,
  add column edited_at timestamptz,
  add column deleted_at timestamptz,
  add constraint messages_content_matches_kind check (
    (kind = 'text' and body is not null and voice_url is null)
    or (kind = 'voice' and voice_url is not null)
  );

alter table public.direct_messages
  alter column body drop not null,
  add column kind text not null default 'text' check (kind in ('text', 'voice')),
  add column voice_url text,
  add column edited_at timestamptz,
  add column deleted_at timestamptz,
  add constraint direct_messages_content_matches_kind check (
    (kind = 'text' and body is not null and voice_url is null)
    or (kind = 'voice' and voice_url is not null)
  );

-- Public bucket for voice note recordings. Files are stored as
-- "<user_id>/<filename>" so ownership can be checked from the path alone —
-- same pattern as avatars/item-photos.
insert into storage.buckets (id, name, public)
values ('voice-messages', 'voice-messages', true)
on conflict (id) do nothing;

create policy "Voice notes are publicly readable"
  on storage.objects for select
  using (bucket_id = 'voice-messages');

create policy "Users can upload their own voice notes"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'voice-messages' and (storage.foldername(name))[1] = auth.uid()::text);

-- No client-facing UPDATE policy on either messages table: edits and
-- deletes both go through the security-definer functions below, which
-- verify the caller is the sender before touching anything. That also
-- means a client can't tamper with sender_id/match_id/created_at while
-- "editing", since these functions only ever set body/kind/voice_url/
-- edited_at/deleted_at explicitly.

create or replace function public.edit_message(p_message_id uuid, p_body text)
returns public.messages
language plpgsql
security definer
set search_path = public
as $$
declare
  updated public.messages;
begin
  if length(trim(p_body)) = 0 then
    raise exception 'Message body cannot be empty';
  end if;

  update public.messages
  set body = p_body, edited_at = now()
  where id = p_message_id
    and sender_id = auth.uid()
    and kind = 'text'
    and deleted_at is null
  returning * into updated;

  if updated.id is null then
    raise exception 'Message not found or not editable';
  end if;
  return updated;
end;
$$;

revoke all on function public.edit_message(uuid, text) from public;
grant execute on function public.edit_message(uuid, text) to authenticated;

create or replace function public.delete_message(p_message_id uuid)
returns public.messages
language plpgsql
security definer
set search_path = public
as $$
declare
  updated public.messages;
begin
  update public.messages
  set deleted_at = now()
  where id = p_message_id
    and sender_id = auth.uid()
    and deleted_at is null
  returning * into updated;

  if updated.id is null then
    raise exception 'Message not found or already deleted';
  end if;
  return updated;
end;
$$;

revoke all on function public.delete_message(uuid) from public;
grant execute on function public.delete_message(uuid) to authenticated;

create or replace function public.edit_direct_message(p_message_id uuid, p_body text)
returns public.direct_messages
language plpgsql
security definer
set search_path = public
as $$
declare
  updated public.direct_messages;
begin
  if length(trim(p_body)) = 0 then
    raise exception 'Message body cannot be empty';
  end if;

  update public.direct_messages
  set body = p_body, edited_at = now()
  where id = p_message_id
    and sender_id = auth.uid()
    and kind = 'text'
    and deleted_at is null
  returning * into updated;

  if updated.id is null then
    raise exception 'Message not found or not editable';
  end if;
  return updated;
end;
$$;

revoke all on function public.edit_direct_message(uuid, text) from public;
grant execute on function public.edit_direct_message(uuid, text) to authenticated;

create or replace function public.delete_direct_message(p_message_id uuid)
returns public.direct_messages
language plpgsql
security definer
set search_path = public
as $$
declare
  updated public.direct_messages;
begin
  update public.direct_messages
  set deleted_at = now()
  where id = p_message_id
    and sender_id = auth.uid()
    and deleted_at is null
  returning * into updated;

  if updated.id is null then
    raise exception 'Message not found or already deleted';
  end if;
  return updated;
end;
$$;

revoke all on function public.delete_direct_message(uuid) from public;
grant execute on function public.delete_direct_message(uuid) to authenticated;

-- send_direct_message gains an optional voice_url so a voice note can go
-- through the same participant-check/notification path as a text message.
drop function if exists public.send_direct_message(uuid, text);

create or replace function public.send_direct_message(p_conversation_id uuid, p_body text default null, p_voice_url text default null)
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

  insert into public.direct_messages (conversation_id, sender_id, body, kind, voice_url)
  values (p_conversation_id, me, p_body, msg_kind, p_voice_url)
  returning * into new_message;

  other_id := case when conv.user_a = me then conv.user_b else conv.user_a end;

  insert into public.notifications (user_id, type, title, body, direct_conversation_id)
  values (other_id, 'message', 'Nouveau message', notif_body, p_conversation_id);

  return new_message;
end;
$$;

revoke all on function public.send_direct_message(uuid, text, text) from public;
grant execute on function public.send_direct_message(uuid, text, text) to authenticated;

-- The inbox preview needs to know a conversation's last message is a voice
-- note or was deleted (so it can show "Note vocale" / "Message supprimé"
-- instead of a null body) — re-create with the two extra columns.
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
  where dc.user_a = auth.uid() or dc.user_b = auth.uid()
  order by coalesce(lm.created_at, dc.created_at) desc;
$$;

revoke all on function public.list_my_direct_conversations() from public;
grant execute on function public.list_my_direct_conversations() to authenticated;
