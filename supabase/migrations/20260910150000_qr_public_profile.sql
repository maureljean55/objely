-- Each user gets a permanent QR code that encodes a link to their public
-- profile (src/app/qr/u/[id]/page.tsx). Scanning it — or another user just
-- visiting the link — needs to read a few safe fields (name, avatar, trust
-- score) for a stranger's profile, which the existing profiles policy
-- ("viewable by their owner" only) doesn't allow.
--
-- Rather than opening a broad SELECT policy on profiles (that would let any
-- authenticated client pull phone/address for anyone via `select *`, not
-- just the intended safe fields), expose a narrow security-definer RPC that
-- only returns the fields the QR profile card actually needs — and only
-- returns the phone number when the profile owner has opted in.

alter table public.profiles
  add column share_phone boolean not null default false;

create or replace function public.get_public_profile(profile_id uuid)
returns table (
  id uuid,
  full_name text,
  avatar_url text,
  trust_score smallint,
  phone text
)
language sql
security definer
set search_path = public
stable
as $$
  select
    profiles.id,
    profiles.full_name,
    profiles.avatar_url,
    profiles.trust_score,
    case when profiles.share_phone then profiles.phone else null end as phone
  from public.profiles
  where profiles.id = profile_id;
$$;

-- Requires auth (scanning happens inside the app) so this can't be scraped
-- anonymously at scale.
revoke all on function public.get_public_profile(uuid) from public;
grant execute on function public.get_public_profile(uuid) to authenticated;
