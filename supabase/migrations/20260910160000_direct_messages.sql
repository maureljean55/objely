-- General-purpose one-to-one messaging, independent of a lost/found match —
-- used by the "Envoyer un message" button on a scanned QR profile
-- (src/app/qr/u/[id]/page.tsx), where two users may have no item match at
-- all and just want to get in touch after meeting via a QR code.

create table public.direct_conversations (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references auth.users (id) on delete cascade,
  user_b uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint direct_conversations_ordered check (user_a < user_b),
  unique (user_a, user_b)
);

alter table public.direct_conversations enable row level security;

create policy "Participants can view their direct conversations"
  on public.direct_conversations for select
  to authenticated
  using (auth.uid() = user_a or auth.uid() = user_b);

-- No client-facing insert policy: conversations are only ever created
-- through get_or_create_direct_conversation below, which enforces the
-- canonical (user_a < user_b) ordering the unique constraint relies on to
-- prevent duplicate conversations between the same two people.

create table public.direct_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.direct_conversations (id) on delete cascade,
  sender_id uuid not null references auth.users (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create index direct_messages_conversation_id_idx on public.direct_messages (conversation_id, created_at);

alter table public.direct_messages enable row level security;

create policy "Participants can view messages in their direct conversations"
  on public.direct_messages for select
  to authenticated
  using (
    exists (
      select 1 from public.direct_conversations dc
      where dc.id = direct_messages.conversation_id
        and (dc.user_a = auth.uid() or dc.user_b = auth.uid())
    )
  );

-- No client-facing insert policy here either: messages (and the
-- notification that goes with one) are only ever created through
-- send_direct_message below, so a client can't forge a message as someone
-- else or notify a user who isn't actually part of the conversation.

alter table public.notifications
  add column direct_conversation_id uuid references public.direct_conversations (id) on delete cascade;

create or replace function public.get_or_create_direct_conversation(other_user_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := auth.uid();
  lo uuid;
  hi uuid;
  conv_id uuid;
begin
  if me is null then
    raise exception 'Not authenticated';
  end if;
  if other_user_id = me then
    raise exception 'Cannot start a conversation with yourself';
  end if;
  if not exists (select 1 from public.profiles where id = other_user_id) then
    raise exception 'User not found';
  end if;

  if me < other_user_id then
    lo := me; hi := other_user_id;
  else
    lo := other_user_id; hi := me;
  end if;

  select id into conv_id from public.direct_conversations where user_a = lo and user_b = hi;
  if conv_id is null then
    insert into public.direct_conversations (user_a, user_b) values (lo, hi)
    returning id into conv_id;
  end if;

  return conv_id;
end;
$$;

revoke all on function public.get_or_create_direct_conversation(uuid) from public;
grant execute on function public.get_or_create_direct_conversation(uuid) to authenticated;

create or replace function public.send_direct_message(p_conversation_id uuid, p_body text)
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
begin
  if me is null then
    raise exception 'Not authenticated';
  end if;
  if length(trim(p_body)) = 0 then
    raise exception 'Message body cannot be empty';
  end if;

  select * into conv from public.direct_conversations where id = p_conversation_id;
  if conv is null or (conv.user_a <> me and conv.user_b <> me) then
    raise exception 'Not a participant of this conversation';
  end if;

  insert into public.direct_messages (conversation_id, sender_id, body)
  values (p_conversation_id, me, p_body)
  returning * into new_message;

  other_id := case when conv.user_a = me then conv.user_b else conv.user_a end;

  insert into public.notifications (user_id, type, title, body, direct_conversation_id)
  values (other_id, 'message', 'Nouveau message', left(p_body, 120), p_conversation_id);

  return new_message;
end;
$$;

revoke all on function public.send_direct_message(uuid, text) from public;
grant execute on function public.send_direct_message(uuid, text) to authenticated;

-- The messages inbox (src/app/messages/page.tsx) needs the other
-- participant's name/avatar for every direct conversation the caller is in.
-- profiles is locked down to "viewable by their owner" only, so this has to
-- go through a security-definer function rather than a client-side join.
create or replace function public.list_my_direct_conversations()
returns table (
  conversation_id uuid,
  other_user_id uuid,
  other_full_name text,
  other_avatar_url text,
  last_message_body text,
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
    lm.sender_id as last_message_sender_id,
    lm.created_at as last_message_created_at
  from public.direct_conversations dc
  join public.profiles other on other.id = (case when dc.user_a = auth.uid() then dc.user_b else dc.user_a end)
  left join lateral (
    select body, sender_id, created_at
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

-- Same reasoning as above, for the single conversation shown on the chat
-- page header (src/app/dm/[conversationId]/page.tsx).
create or replace function public.get_direct_conversation_peer(p_conversation_id uuid)
returns table (id uuid, full_name text, avatar_url text)
language sql
security definer
set search_path = public
stable
as $$
  select other.id, other.full_name, other.avatar_url
  from public.direct_conversations dc
  join public.profiles other on other.id = (case when dc.user_a = auth.uid() then dc.user_b else dc.user_a end)
  where dc.id = p_conversation_id
    and (dc.user_a = auth.uid() or dc.user_b = auth.uid());
$$;

revoke all on function public.get_direct_conversation_peer(uuid) from public;
grant execute on function public.get_direct_conversation_peer(uuid) to authenticated;
