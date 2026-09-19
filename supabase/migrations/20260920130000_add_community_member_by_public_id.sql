-- add_community_member_by_public_id: lets an existing member add someone
-- else straight into the community by their permanent public_id (see
-- 20260920100000_profiles_public_id.sql's own comment anticipating this use
-- case), sidestepping the self-only "Users can join a community as a
-- member" INSERT policy the same way create_community seeds the owner row.
create function public.add_community_member_by_public_id(
  p_community_id uuid,
  p_public_id integer
)
returns public.community_members
language plpgsql
security definer
set search_path = public
as $$
declare
  target uuid;
  new_row public.community_members;
begin
  if not public.is_community_member(p_community_id) then
    raise exception 'Not a member of this community';
  end if;

  select id into target from public.profiles where public_id = p_public_id;
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

  return new_row;
end;
$$;

revoke all on function public.add_community_member_by_public_id(uuid, integer) from public;
grant execute on function public.add_community_member_by_public_id(uuid, integer) to authenticated;
