-- Lets a photo/gallery image or PDF be sent as a chat message, the same way
-- support_messages already supports attachments (see
-- 20260919160000_support_attachments.sql) — mirrors that shape (kind,
-- attachment_url/name/type) and the voice-messages bucket's own-folder
-- upload policy, applied to both message tables ChatThread.tsx renders
-- (match-based "messages" and QR/DM-based "direct_messages").

insert into storage.buckets (id, name, public)
values ('message-attachments', 'message-attachments', true)
on conflict (id) do nothing;

create policy "Message attachments are publicly readable"
  on storage.objects for select
  using (bucket_id = 'message-attachments');

create policy "Users can upload their own message attachments"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'message-attachments' and (storage.foldername(name))[1] = auth.uid()::text);

alter table public.messages
  add column attachment_url text,
  add column attachment_name text,
  add column attachment_type text;

alter table public.messages
  drop constraint messages_content_matches_kind,
  drop constraint messages_kind_check;

alter table public.messages
  add constraint messages_kind_check check (kind in ('text', 'voice', 'restitution_proposal', 'attachment')),
  add constraint messages_content_matches_kind check (
    (kind = 'text' and body is not null and voice_url is null)
    or (kind = 'voice' and voice_url is not null)
    or (kind = 'restitution_proposal' and restitution_appointment_id is not null)
    or (kind = 'attachment' and attachment_url is not null)
  );

alter table public.direct_messages
  add column attachment_url text,
  add column attachment_name text,
  add column attachment_type text;

alter table public.direct_messages
  drop constraint direct_messages_content_matches_kind,
  drop constraint direct_messages_kind_check;

alter table public.direct_messages
  add constraint direct_messages_kind_check check (kind in ('text', 'voice', 'attachment')),
  add constraint direct_messages_content_matches_kind check (
    (kind = 'text' and body is not null and voice_url is null)
    or (kind = 'voice' and voice_url is not null)
    or (kind = 'attachment' and attachment_url is not null)
  );

-- send_direct_message gains an optional attachment, alongside the existing
-- optional voice_url — mutually exclusive, same as voice.
drop function if exists public.send_direct_message(uuid, text, text, uuid);

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

  insert into public.notifications (user_id, type, title, body, direct_conversation_id)
  values (other_id, 'message', 'Nouveau message', notif_body, p_conversation_id);

  return new_message;
end;
$$;

revoke all on function public.send_direct_message(uuid, text, text, uuid, text, text, text) from public;
grant execute on function public.send_direct_message(uuid, text, text, uuid, text, text, text) to authenticated;
