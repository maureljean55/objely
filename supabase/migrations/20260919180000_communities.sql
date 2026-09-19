-- Communities: local groups of "déclarants" (people who report lost/found
-- items) who want to coordinate outside of a single item match — e.g.
-- neighborhood or campus groups. No structured geo data exists anywhere in
-- this app (profiles.address and items.location are both free text), so
-- "ville_quartier" here is free text too and discovery is browse/search,
-- not geo-matching.

create table public.communities (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (length(trim(name)) between 3 and 60),
  description text check (description is null or length(description) <= 500),
  ville_quartier text check (ville_quartier is null or length(ville_quartier) <= 80),
  cover_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger communities_set_updated_at
  before update on public.communities
  for each row execute function public.set_updated_at();

create index communities_created_at_idx on public.communities (created_at desc);

-- Community membership. Roles are a plain checked text column (this
-- codebase's convention — see messages.kind) rather than an enum, so a
-- future role can be added without an ALTER TYPE migration.
create table public.community_members (
  community_id uuid not null references public.communities (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  joined_at timestamptz not null default now(),
  primary key (community_id, user_id)
);

create index community_members_user_id_idx on public.community_members (user_id);

-- Group chat, one row per message, scoped to a community instead of a
-- direct_conversation/match. Mirrors direct_messages' kind/edited_at/
-- deleted_at/reply_to_id shape (v1 only ever writes kind='text'; 'voice' is
-- reserved so a future migration can extend it the same way
-- 20260910180000_message_edit_delete_voice.sql did for direct_messages,
-- without another ALTER TABLE ... check).
create table public.community_messages (
  id uuid primary key default gen_random_uuid(),
  community_id uuid not null references public.communities (id) on delete cascade,
  sender_id uuid not null references auth.users (id) on delete cascade,
  body text,
  kind text not null default 'text' check (kind in ('text', 'voice')),
  voice_url text,
  edited_at timestamptz,
  deleted_at timestamptz,
  reply_to_id uuid references public.community_messages (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint community_messages_content_matches_kind check (
    (kind = 'text' and body is not null and voice_url is null)
    or (kind = 'voice' and voice_url is not null)
  )
);

create index community_messages_community_id_idx on public.community_messages (community_id, created_at);

-- Member counts for the directory list, without exposing member rows
-- directly (community_members itself stays members-only via RLS below).
create view public.communities_with_counts as
  select
    c.*,
    (select count(*) from public.community_members m where m.community_id = c.id)::int as member_count
  from public.communities c;

alter table public.communities enable row level security;
alter table public.community_members enable row level security;
alter table public.community_messages enable row level security;

-- ---------------------------------------------------------------------
-- Recursion-safe membership check (see 20260910170000_fix_match_confirm_
-- recursion.sql for the class of bug this avoids). A RLS policy on
-- community_members that self-joins community_members from within its own
-- USING clause is exactly the A-references-A cycle that migration had to
-- work around — so the membership test is a security-definer function
-- instead, called by every policy below that needs "is this caller in
-- this community".
create function public.is_community_member(p_community_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.community_members
    where community_id = p_community_id and user_id = auth.uid()
  );
$$;

revoke all on function public.is_community_member(uuid) from public;
grant execute on function public.is_community_member(uuid) to anon, authenticated;

create function public.is_community_owner(p_community_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.communities
    where id = p_community_id and owner_id = auth.uid()
  );
$$;

revoke all on function public.is_community_owner(uuid) from public;
grant execute on function public.is_community_owner(uuid) to anon, authenticated;

-- ---------------------------------------------------------------------
-- communities: browse is public, including anonymous visitors — same
-- precedent as 20260910140000_anon_can_view_found_items.sql (found items
-- are publicly browsable for growth/engagement). Nothing sensitive is
-- exposed here (name/description/city/cover/count only).
--
-- No client-facing INSERT: create_community() below atomically creates the
-- row AND the owner's membership row, which a plain RLS insert can't do in
-- one statement without a race between "create" and "become a member".

create policy "Anyone can browse the community directory"
  on public.communities for select
  using (true);

create policy "Owner can update their community"
  on public.communities for update
  to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "Owner can delete their community"
  on public.communities for delete
  to authenticated
  using (owner_id = auth.uid());

-- ---------------------------------------------------------------------
-- community_members: you can always see your own membership rows (needed
-- to know which communities you're in / render "Rejoindre" vs the chat).
-- Seeing *other* members' rows also requires being a member yourself,
-- checked via the security-definer helper to avoid the recursion trap —
-- but even then this only exposes user_id/role, never profile data (that
-- goes through list_community_members() below).
create policy "Members can view their own membership rows"
  on public.community_members for select
  to authenticated
  using (user_id = auth.uid());

create policy "Members can view fellow members of shared communities"
  on public.community_members for select
  to authenticated
  using (public.is_community_member(community_id));

-- Self-service join: anyone authenticated can insert themselves as
-- 'member' (never 'owner' — that only ever happens inside create_community).
create policy "Users can join a community as a member"
  on public.community_members for insert
  to authenticated
  with check (user_id = auth.uid() and role = 'member');

-- Leave, but not if you're the owner (owner must delete the community
-- instead — otherwise a community could end up with zero owners).
create policy "Members can leave a community they don't own"
  on public.community_members for delete
  to authenticated
  using (user_id = auth.uid() and role <> 'owner');

-- ---------------------------------------------------------------------
-- community_messages: members-only read. No client-facing INSERT/UPDATE:
-- send_community_message() and delete_community_message() below verify
-- membership/ownership and stamp sender_id server-side, so a client can
-- never post as someone else, into a community it hasn't joined, or edit
-- another sender's message disguised as their own.
create policy "Members can read messages in their communities"
  on public.community_messages for select
  to authenticated
  using (public.is_community_member(community_id));

-- ---------------------------------------------------------------------
-- create_community: atomically creates the community row and inserts the
-- creator as 'owner' — doing this as two separate client-side statements
-- would leave a community with no owner membership row if the second
-- statement failed (e.g. network drop), and RLS can't express "insert into
-- two tables in one go" on its own.
create function public.create_community(
  p_name text,
  p_description text default null,
  p_ville_quartier text default null,
  p_cover_url text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := auth.uid();
  new_id uuid;
begin
  if me is null then
    raise exception 'Not authenticated';
  end if;
  if length(trim(coalesce(p_name, ''))) < 3 then
    raise exception 'Community name must be at least 3 characters';
  end if;

  insert into public.communities (owner_id, name, description, ville_quartier, cover_url)
  values (
    me,
    trim(p_name),
    nullif(trim(coalesce(p_description, '')), ''),
    nullif(trim(coalesce(p_ville_quartier, '')), ''),
    p_cover_url
  )
  returning id into new_id;

  insert into public.community_members (community_id, user_id, role)
  values (new_id, me, 'owner');

  return new_id;
end;
$$;

revoke all on function public.create_community(text, text, text, text) from public;
grant execute on function public.create_community(text, text, text, text) to authenticated;

-- list_community_members: profiles is locked to "viewable by their owner"
-- only (see public.profiles RLS), so listing other members' names/avatars
-- for the members sheet has to go through a security-definer function,
-- exactly like list_my_direct_conversations/get_direct_conversation_peer.
-- Also enforces "caller must be a member" itself (doesn't rely solely on
-- community_members' own RLS) since this bypasses that RLS entirely.
create function public.list_community_members(p_community_id uuid)
returns table (
  user_id uuid,
  full_name text,
  avatar_url text,
  role text,
  joined_at timestamptz
)
language plpgsql
security definer
set search_path = public
stable
as $$
begin
  if not public.is_community_member(p_community_id) then
    raise exception 'Not a member of this community';
  end if;

  return query
    select p.id, p.full_name, p.avatar_url, m.role, m.joined_at
    from public.community_members m
    join public.profiles p on p.id = m.user_id
    where m.community_id = p_community_id
    order by (m.role = 'owner') desc, m.joined_at asc;
  return;
end;
$$;

revoke all on function public.list_community_members(uuid) from public;
grant execute on function public.list_community_members(uuid) to authenticated;

-- send_community_message: membership check + sender_id stamped
-- server-side, same shape as send_direct_message.
create function public.send_community_message(
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
  if not public.is_community_member(p_community_id) then
    raise exception 'Not a member of this community';
  end if;
  if length(trim(coalesce(p_body, ''))) = 0 then
    raise exception 'Message body cannot be empty';
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

revoke all on function public.send_community_message(uuid, text, uuid) from public;
grant execute on function public.send_community_message(uuid, text, uuid) to authenticated;

-- delete_community_message: soft delete, sender-only — same pattern as
-- delete_direct_message.
create function public.delete_community_message(p_message_id uuid)
returns public.community_messages
language plpgsql
security definer
set search_path = public
as $$
declare
  updated public.community_messages;
begin
  update public.community_messages
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

revoke all on function public.delete_community_message(uuid) from public;
grant execute on function public.delete_community_message(uuid) to authenticated;

-- Realtime for the group chat (RLS above still governs what each
-- subscriber actually receives).
alter publication supabase_realtime add table public.community_messages;

-- Optional cover-photo bucket, same convention as avatars/voice-messages/
-- support-attachments: public bucket, own-folder-only insert, no
-- update/delete (a new cover is just a new upload + communities.cover_url
-- update, not a replace-in-place).
insert into storage.buckets (id, name, public)
values ('community-covers', 'community-covers', true)
on conflict (id) do nothing;

create policy "Community cover photos are publicly readable"
  on storage.objects for select
  using (bucket_id = 'community-covers');

create policy "Users can upload their own community cover photos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'community-covers' and (storage.foldername(name))[1] = auth.uid()::text);
