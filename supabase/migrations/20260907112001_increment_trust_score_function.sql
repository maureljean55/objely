-- Atomically bumps the calling user's own trust score (clamped to 100),
-- called when they declare a found item and again when a restitution they
-- handled is confirmed. A single UPDATE avoids the read-then-write race a
-- plain client-side update would have.
create function public.increment_trust_score(delta smallint)
returns void
language sql
security invoker
as $$
  update public.profiles set trust_score = least(trust_score + delta, 100) where id = auth.uid();
$$;
