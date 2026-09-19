-- Switch profiles.public_id from a sequential integer to a short random
-- alphanumeric code (7 characters, e.g. "K7M2PQD"). A sequential integer
-- reveals signup order and is tedious to read aloud; a fixed-width mixed
-- code reads like the short codes people already expect from invite/share
-- flows. Excludes visually ambiguous characters (0/O, 1/I/L) so a code
-- typed by hand from someone's profile screen is less likely to be
-- mistyped.

alter table public.profiles
  alter column public_id drop default;

alter table public.profiles
  alter column public_id type text using public_id::text;

drop sequence if exists public.profiles_public_id_seq;

create function public.generate_public_id()
returns text
language plpgsql
as $$
declare
  alphabet text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  code text;
begin
  loop
    code := (
      select string_agg(substr(alphabet, (random() * length(alphabet))::int + 1, 1), '')
      from generate_series(1, 7)
    );
    exit when not exists (select 1 from public.profiles where public_id = code);
  end loop;
  return code;
end;
$$;

alter table public.profiles
  alter column public_id set default public.generate_public_id();

-- Backfill every existing profile with a code in the new format.
update public.profiles set public_id = public.generate_public_id();

-- add_community_member_by_public_id now looks codes up as text (case-
-- insensitively — the caller may have typed it in lowercase).
drop function if exists public.add_community_member_by_public_id(uuid, integer);

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
begin
  if not public.is_community_member(p_community_id) then
    raise exception 'Not a member of this community';
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

  return new_row;
end;
$$;

revoke all on function public.add_community_member_by_public_id(uuid, text) from public;
grant execute on function public.add_community_member_by_public_id(uuid, text) to authenticated;
