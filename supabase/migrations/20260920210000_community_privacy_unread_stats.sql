-- Three real-data features for the redesigned communities directory:
-- 1. Private communities with an owner-approved join request flow, plus an
--    "allow_member_invites" setting (both surfaced in the mockup's create
--    form and, before this, entirely absent from the schema).
-- 2. Per-member unread counts, so the "Mes communautés" rows can show a
--    real badge instead of the mockup's static "3".
-- 3. A real weekly count of items recovered/returned by fellow members of
--    the caller's communities, replacing the mockup's invented "48 prêts".

-- ---------------------------------------------------------------------
-- 1. Privacy + join requests

alter table public.communities
  add column is_private boolean not null default false,
  add column allow_member_invites boolean not null default true;

create table public.community_join_requests (
  id uuid primary key default gen_random_uuid(),
  community_id uuid not null references public.communities (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'approved', 'declined')),
  created_at timestamptz not null default now(),
  decided_at timestamptz,
  unique (community_id, user_id)
);

create index community_join_requests_community_id_idx on public.community_join_requests (community_id, status);

alter table public.community_join_requests enable row level security;

create policy "Requesters can view their own join requests"
  on public.community_join_requests for select
  to authenticated
  using (user_id = auth.uid());

create policy "Owners can view join requests for their community"
  on public.community_join_requests for select
  to authenticated
  using (public.is_community_owner(community_id));

-- No client-facing insert/update/delete: request_join_community and
-- respond_to_join_request below own the whole lifecycle, same reasoning as
-- create_community owning the community+membership insert pair.

-- create_community gains the two new settings.
drop function if exists public.create_community(text, text, text, text);

create function public.create_community(
  p_name text,
  p_description text default null,
  p_ville_quartier text default null,
  p_cover_url text default null,
  p_is_private boolean default false,
  p_allow_member_invites boolean default true
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

  insert into public.communities (owner_id, name, description, ville_quartier, cover_url, is_private, allow_member_invites)
  values (
    me,
    trim(p_name),
    nullif(trim(coalesce(p_description, '')), ''),
    nullif(trim(coalesce(p_ville_quartier, '')), ''),
    p_cover_url,
    coalesce(p_is_private, false),
    coalesce(p_allow_member_invites, true)
  )
  returning id into new_id;

  insert into public.community_members (community_id, user_id, role)
  values (new_id, me, 'owner');

  return new_id;
end;
$$;

revoke all on function public.create_community(text, text, text, text, boolean, boolean) from public;
grant execute on function public.create_community(text, text, text, text, boolean, boolean) to authenticated;

-- The old self-join policy had no privacy gate at all — replaced by
-- request_join_community below, which is now the only path to
-- community_members for a self-service join (public or private).
drop policy "Users can join a community as a member" on public.community_members;

create or replace function public.request_join_community(p_community_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := auth.uid();
  community public.communities;
begin
  if me is null then
    raise exception 'Not authenticated';
  end if;

  select * into community from public.communities where id = p_community_id;
  if community is null then
    raise exception 'Community not found';
  end if;

  if exists (select 1 from public.community_members where community_id = p_community_id and user_id = me) then
    raise exception 'Already a member';
  end if;

  if community.is_private then
    insert into public.community_join_requests (community_id, user_id, status, created_at, decided_at)
    values (p_community_id, me, 'pending', now(), null)
    on conflict (community_id, user_id) do update
      set status = 'pending', created_at = now(), decided_at = null
      where community_join_requests.status <> 'pending';

    insert into public.notifications (user_id, type, title, body, community_id)
    values (
      community.owner_id,
      'community_join_request',
      'Nouvelle demande',
      format('Quelqu''un souhaite rejoindre "%s".', community.name),
      p_community_id
    );

    return 'requested';
  else
    insert into public.community_members (community_id, user_id, role)
    values (p_community_id, me, 'member');
    return 'joined';
  end if;
end;
$$;

revoke all on function public.request_join_community(uuid) from public;
grant execute on function public.request_join_community(uuid) to authenticated;

create or replace function public.get_my_join_request_status(p_community_id uuid)
returns text
language sql
security definer
set search_path = public
stable
as $$
  select status from public.community_join_requests
  where community_id = p_community_id and user_id = auth.uid() and status = 'pending';
$$;

revoke all on function public.get_my_join_request_status(uuid) from public;
grant execute on function public.get_my_join_request_status(uuid) to authenticated;

create or replace function public.list_community_join_requests(p_community_id uuid)
returns table (id uuid, user_id uuid, full_name text, avatar_url text, created_at timestamptz)
language plpgsql
security definer
set search_path = public
stable
as $$
begin
  if not public.is_community_owner(p_community_id) then
    raise exception 'Only the owner can view join requests';
  end if;

  return query
    select r.id, p.id, p.full_name, p.avatar_url, r.created_at
    from public.community_join_requests r
    join public.profiles p on p.id = r.user_id
    where r.community_id = p_community_id and r.status = 'pending'
    order by r.created_at asc;
end;
$$;

revoke all on function public.list_community_join_requests(uuid) from public;
grant execute on function public.list_community_join_requests(uuid) to authenticated;

create or replace function public.respond_to_join_request(p_request_id uuid, p_approve boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  req public.community_join_requests;
begin
  select * into req from public.community_join_requests where id = p_request_id;
  if req is null then
    raise exception 'Request not found';
  end if;
  if not public.is_community_owner(req.community_id) then
    raise exception 'Only the owner can respond to join requests';
  end if;
  if req.status <> 'pending' then
    raise exception 'Request already decided';
  end if;

  update public.community_join_requests
  set status = case when p_approve then 'approved' else 'declined' end, decided_at = now()
  where id = p_request_id;

  if p_approve then
    insert into public.community_members (community_id, user_id, role)
    values (req.community_id, req.user_id, 'member')
    on conflict do nothing;
  end if;

  insert into public.notifications (user_id, type, title, body, community_id)
  values (
    req.user_id,
    'community_join_response',
    case when p_approve then 'Demande acceptée' else 'Demande refusée' end,
    format(
      'Votre demande pour rejoindre "%s" a été %s.',
      (select name from public.communities where id = req.community_id),
      case when p_approve then 'acceptée' else 'refusée' end
    ),
    req.community_id
  );
end;
$$;

revoke all on function public.respond_to_join_request(uuid, boolean) from public;
grant execute on function public.respond_to_join_request(uuid, boolean) to authenticated;

-- add_community_member_by_public_id now also allows any member to invite
-- when the community's allow_member_invites is on (previously owner-only,
-- unconditionally, since that setting didn't exist).
create or replace function public.add_community_member_by_public_id(
  p_community_id uuid,
  p_public_id text
)
returns public.community_members
language plpgsql
security definer
set search_path = public
as $$
declare
  target uuid;
  new_row public.community_members;
  code text := upper(trim(coalesce(p_public_id, '')));
  v_community public.communities;
begin
  select * into v_community from public.communities where id = p_community_id;
  if v_community is null then
    raise exception 'Community not found';
  end if;

  if not (
    public.is_community_owner(p_community_id)
    or (v_community.allow_member_invites and public.is_community_member(p_community_id))
  ) then
    raise exception 'Only the owner can add members';
  end if;
  if code = '' then
    raise exception 'No user found with that public ID';
  end if;

  select id into target from public.profiles where public_id = code;
  if target is null then
    raise exception 'No user found with that public ID';
  end if;

  if exists (
    select 1 from public.community_members
    where community_id = p_community_id and user_id = target
  ) then
    raise exception 'That user is already a member of this community';
  end if;

  insert into public.community_members (community_id, user_id, role)
  values (p_community_id, target, 'member')
  returning * into new_row;

  insert into public.notifications (user_id, type, title, body, community_id)
  values (
    target,
    'community_added',
    'Ajouté à une communauté',
    format('Vous avez été ajouté à la communauté "%s".', v_community.name),
    p_community_id
  );

  return new_row;
end;
$$;

revoke all on function public.add_community_member_by_public_id(uuid, text) from public;
grant execute on function public.add_community_member_by_public_id(uuid, text) to authenticated;

-- ---------------------------------------------------------------------
-- 2. Unread counts

alter table public.community_members
  add column last_read_at timestamptz not null default now();

create or replace function public.mark_community_read(p_community_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.community_members
  set last_read_at = now()
  where community_id = p_community_id and user_id = auth.uid();
$$;

revoke all on function public.mark_community_read(uuid) from public;
grant execute on function public.mark_community_read(uuid) to authenticated;

drop function if exists public.list_my_communities_with_last_message();

create function public.list_my_communities_with_last_message()
returns table (
  community_id uuid,
  last_message_body text,
  last_message_kind text,
  last_message_deleted_at timestamptz,
  last_message_sender_name text,
  last_message_created_at timestamptz,
  unread_count int
)
language sql
security definer
set search_path = public
stable
as $$
  select
    cm.community_id,
    lm.body,
    lm.kind,
    lm.deleted_at,
    sender.full_name,
    lm.created_at,
    (
      select count(*)::int
      from public.community_messages msg
      where msg.community_id = cm.community_id
        and msg.created_at > cm.last_read_at
        and msg.sender_id <> auth.uid()
        and msg.deleted_at is null
    ) as unread_count
  from public.community_members cm
  left join lateral (
    select body, kind, deleted_at, sender_id, created_at
    from public.community_messages
    where community_id = cm.community_id
    order by created_at desc
    limit 1
  ) lm on true
  left join public.profiles sender on sender.id = lm.sender_id
  where cm.user_id = auth.uid();
$$;

revoke all on function public.list_my_communities_with_last_message() from public;
grant execute on function public.list_my_communities_with_last_message() to authenticated;

-- ---------------------------------------------------------------------
-- 3. Real "circular sharing" weekly stat: items recovered/returned in the
-- last 7 days, owned by anyone who shares at least one community with the
-- caller (including the caller). Deliberately not framed as caused by the
-- community (matches happen independently of it) — just "activity among
-- people in your communities this week".
create or replace function public.my_communities_weekly_recovered_count()
returns int
language sql
security definer
set search_path = public
stable
as $$
  select count(distinct i.id)::int
  from public.items i
  join public.community_members cm on cm.user_id = i.user_id
  where i.status in ('recovered', 'returned')
    and i.updated_at > now() - interval '7 days'
    and cm.community_id in (
      select community_id from public.community_members where user_id = auth.uid()
    );
$$;

revoke all on function public.my_communities_weekly_recovered_count() from public;
grant execute on function public.my_communities_weekly_recovered_count() to authenticated;
