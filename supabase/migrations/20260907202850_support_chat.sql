-- Real support chat: one conversation per user (reused across visits while
-- still open), holding both the AI bot's replies and, once escalated, a
-- human agent's. The admin-side page to work escalated conversations is
-- built later — this just needs "status" to be filterable then.
create type public.support_status as enum ('bot', 'escalated', 'closed');
create type public.support_sender as enum ('user', 'bot', 'admin');

create table public.support_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  status public.support_status not null default 'bot',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.support_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.support_conversations (id) on delete cascade,
  sender public.support_sender not null,
  body text not null,
  created_at timestamptz not null default now()
);

create index support_messages_conversation_id_idx on public.support_messages (conversation_id);

alter table public.support_conversations enable row level security;
alter table public.support_messages enable row level security;

create policy "Users can view their own support conversations"
  on public.support_conversations for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can create their own support conversations"
  on public.support_conversations for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own support conversations"
  on public.support_conversations for update
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can view messages in their own support conversations"
  on public.support_messages for select
  to authenticated
  using (
    exists (
      select 1 from public.support_conversations
      where support_conversations.id = support_messages.conversation_id
        and support_conversations.user_id = auth.uid()
    )
  );

create policy "Users can send messages in their own support conversations"
  on public.support_messages for insert
  to authenticated
  with check (
    exists (
      select 1 from public.support_conversations
      where support_conversations.id = support_messages.conversation_id
        and support_conversations.user_id = auth.uid()
    )
  );

create trigger set_support_conversations_updated_at
  before update on public.support_conversations
  for each row execute function public.set_updated_at();
