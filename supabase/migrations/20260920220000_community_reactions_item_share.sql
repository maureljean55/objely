-- Two more pieces of the redesigned group chat
-- (stitch_objely_communities_feature/conversation_de_la_communaut):
-- emoji reactions on any message, and sharing one of your own declared
-- items as a message ("OBJET PARTAGÉ" card with a "Voir l'objet" link).

-- ---------------------------------------------------------------------
-- Reactions

create table public.community_message_reactions (
  message_id uuid not null references public.community_messages (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  emoji text not null check (length(emoji) between 1 and 8),
  created_at timestamptz not null default now(),
  primary key (message_id, user_id, emoji)
);

create index community_message_reactions_message_id_idx on public.community_message_reactions (message_id);

alter table public.community_message_reactions enable row level security;

create policy "Members can view reactions in their communities"
  on public.community_message_reactions for select
  to authenticated
  using (
    exists (
      select 1 from public.community_messages m
      where m.id = message_id and public.is_community_member(m.community_id)
    )
  );

-- No client-facing insert/delete: toggle_community_message_reaction below
-- owns both (a plain RLS pair can't express "toggle" atomically, and this
-- also re-checks membership server-side rather than trusting the client).
create function public.toggle_community_message_reaction(p_message_id uuid, p_emoji text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := auth.uid();
  target_community uuid;
begin
  if me is null then
    raise exception 'Not authenticated';
  end if;

  select community_id into target_community from public.community_messages where id = p_message_id;
  if target_community is null then
    raise exception 'Message not found';
  end if;
  if not public.is_community_member(target_community) then
    raise exception 'Not a member of this community';
  end if;

  delete from public.community_message_reactions
  where message_id = p_message_id and user_id = me and emoji = p_emoji;

  if found then
    return false;
  end if;

  insert into public.community_message_reactions (message_id, user_id, emoji)
  values (p_message_id, me, p_emoji);
  return true;
end;
$$;

revoke all on function public.toggle_community_message_reaction(uuid, text) from public;
grant execute on function public.toggle_community_message_reaction(uuid, text) to authenticated;

alter publication supabase_realtime add table public.community_message_reactions;

-- ---------------------------------------------------------------------
-- Sharing a declared item into the chat

alter table public.community_messages
  add column shared_item_id uuid references public.items (id) on delete set null;

alter table public.community_messages
  drop constraint community_messages_content_matches_kind,
  drop constraint community_messages_kind_check;

alter table public.community_messages
  add constraint community_messages_kind_check check (kind in ('text', 'voice', 'item_share')),
  add constraint community_messages_content_matches_kind check (
    (kind = 'text' and body is not null and voice_url is null)
    or (kind = 'voice' and voice_url is not null)
    or (kind = 'item_share' and shared_item_id is not null)
  );

-- Only your own declaration, so this can't be used to promote someone
-- else's item without their say-so — same ownership check
-- send_community_message already relies on implicitly via RLS on items.
create or replace function public.send_community_item_share(
  p_community_id uuid,
  p_item_id uuid
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
  if not public.is_community_member(p_community_id) then
    raise exception 'Not a member of this community';
  end if;
  if not exists (select 1 from public.items where id = p_item_id and user_id = me) then
    raise exception 'You can only share your own items';
  end if;

  insert into public.community_messages (community_id, sender_id, kind, shared_item_id)
  values (p_community_id, me, 'item_share', p_item_id)
  returning * into new_message;

  return new_message;
end;
$$;

revoke all on function public.send_community_item_share(uuid, uuid) from public;
grant execute on function public.send_community_item_share(uuid, uuid) to authenticated;

-- ---------------------------------------------------------------------
-- "Objets partagés" count for the new Informations et membres screen.
create or replace function public.count_community_shared_items(p_community_id uuid)
returns int
language sql
security definer
set search_path = public
stable
as $$
  select count(*)::int
  from public.community_messages
  where community_id = p_community_id and kind = 'item_share' and deleted_at is null;
$$;

revoke all on function public.count_community_shared_items(uuid) from public;
grant execute on function public.count_community_shared_items(uuid) to authenticated;
