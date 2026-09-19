-- A permanent, sequential public ID (shown on the profile page as "id:
-- @<number>") — a stable, non-guessable-in-advance way to identify a user
-- that's independent of their (editable) display name, e.g. for pointing
-- someone to a specific account when adding them to a community.
--
-- nextval() is volatile, so Postgres can't use the fast metadata-only path
-- for ADD COLUMN ... DEFAULT here — it rewrites the table and calls
-- nextval() once per existing row as part of this single statement, which
-- backfills every current profile with a unique number for free, with no
-- separate UPDATE step needed.
create sequence public.profiles_public_id_seq;

alter table public.profiles
  add column public_id integer not null unique default nextval('public.profiles_public_id_seq');

alter sequence public.profiles_public_id_seq owned by public.profiles.public_id;
