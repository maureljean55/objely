-- The "+" button in the help chat's input bar had no handler at all.
-- Wiring it up to attach a photo, PDF, or other file needs a storage
-- bucket (mirrors voice-messages: public bucket, own-folder-only upload,
-- no update/delete) and a way for support_messages to represent an
-- attachment instead of (or without) plain text.

insert into storage.buckets (id, name, public)
values ('support-attachments', 'support-attachments', true)
on conflict (id) do nothing;

create policy "Support attachments are publicly readable"
  on storage.objects for select
  using (bucket_id = 'support-attachments');

create policy "Users can upload their own support attachments"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'support-attachments' and (storage.foldername(name))[1] = auth.uid()::text);

alter table public.support_messages
  add column kind text not null default 'text',
  add column attachment_url text,
  add column attachment_name text,
  add column attachment_type text;

alter table public.support_messages
  alter column body drop not null;

alter table public.support_messages
  add constraint support_messages_kind_check check (kind in ('text', 'attachment')),
  add constraint support_messages_content_matches_kind check (
    (kind = 'text' and body is not null)
    or (kind = 'attachment' and attachment_url is not null)
  );
