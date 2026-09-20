-- Fixes from a security/functionality review of the communities feature:
--
-- 1. Only the owner may add or remove members. Previously any member could
--    silently add anyone (by public_id) with no consent step and no way to
--    undo it — the same trust boundary "delete the community" already had,
--    now applied consistently.
-- 2. Being added now generates a notification instead of the person only
--    discovering it by happening to open /communities.
-- 3. generate_public_id() is locked down like every other function here and
--    made SECURITY DEFINER, so its own-row-only visibility under
--    profiles' RLS can't silently defeat its uniqueness check if something
--    ever calls it directly instead of only via the public_id column
--    default (which already ran under handle_new_user()'s SECURITY
--    DEFINER context, so this is a hardening fix, not a live bug).
-- 4. send_community_message() now caps message length.
-- 5. Deleting a community also removes its cover photo from storage
--    instead of leaving it orphaned.

-- --- 1: owner-only add, new remove function -------------------------------

drop function if exists public.add_community_member_by_public_id(uuid, text);

create function public.add_community_member_by_public_id(
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
  v_community_name text;
begin
  if not public.is_community_owner(p_community_id) then
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

  select name into v_community_name from public.communities where id = p_community_id;

  insert into public.notifications (user_id, type, title, body, community_id)
  values (
    target,
    'community_added',
    'Ajouté à une communauté',
    format('Vous avez été ajouté à la communauté "%s".', v_community_name),
    p_community_id
  );

  return new_row;
end;
$$;

revoke all on function public.add_community_member_by_public_id(uuid, text) from public;
grant execute on function public.add_community_member_by_public_id(uuid, text) to authenticated;

-- Owner-only removal. Can't remove the owner row (there must always be one
-- — deleting the community is the only way to end it) and can't be used on
-- yourself (leave, or delete the community, instead).
create function public.remove_community_member(p_community_id uuid, p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_community_owner(p_community_id) then
    raise exception 'Only the owner can remove a member';
  end if;
  if p_user_id = auth.uid() then
    raise exception 'Use leave or delete the community instead';
  end if;

  delete from public.community_members
  where community_id = p_community_id and user_id = p_user_id and role <> 'owner';
end;
$$;

revoke all on function public.remove_community_member(uuid, uuid) from public;
grant execute on function public.remove_community_member(uuid, uuid) to authenticated;

-- --- 2: notifications on being added ---------------------------------------

alter table public.notifications
  add column community_id uuid references public.communities (id) on delete cascade;

-- --- 3: lock down + harden generate_public_id ------------------------------

alter function public.generate_public_id() security definer;
revoke all on function public.generate_public_id() from public;
grant execute on function public.generate_public_id() to authenticated;

-- --- 4: cap message length --------------------------------------------------

create or replace function public.send_community_message(
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
  if length(p_body) > 4000 then
    raise exception 'Message is too long';
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

-- --- 5: storage cleanup on community deletion ------------------------------

create policy "Users can delete their own community cover photos"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'community-covers' and (storage.foldername(name))[1] = auth.uid()::text);
