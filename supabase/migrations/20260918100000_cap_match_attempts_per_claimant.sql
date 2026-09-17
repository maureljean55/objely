-- Anti-fraud hardening: a rejected match only blocks that exact
-- (lost_item_id, found_item_id) pair. Since the match score is computed
-- purely from a lost item's own public-ish attributes (category/colors/
-- brand/location/date — nothing the claimant couldn't invent), nothing
-- stopped an attacker from creating a fresh "lost" declaration against the
-- same found item after each rejection and submitting a new guess at its
-- private detail, with no limit — an unbounded brute-force/wear-down
-- vector against the finder's manual review.
--
-- Cap it: a claimant (a lost item's owner) gets at most MAX_ATTEMPTS
-- matches — pending, confirmed, or rejected, so an attacker can't dodge
-- the cap by leaving old attempts pending forever either — against the
-- same found item.

create or replace function public.claimant_attempt_count(p_claimant uuid, p_found_item_id uuid)
returns integer
language sql
stable
as $$
  select count(*)::int
  from public.matches m
  join public.items li on li.id = m.lost_item_id
  where m.found_item_id = p_found_item_id
    and li.user_id = p_claimant
$$;

drop policy "An involved owner can record a genuinely scored match" on public.matches;

create policy "An involved owner can record a genuinely scored match"
  on public.matches for insert
  to authenticated
  with check (
    (
      exists (select 1 from public.items where items.id = matches.lost_item_id and items.user_id = auth.uid())
      or exists (select 1 from public.items where items.id = matches.found_item_id and items.user_id = auth.uid())
    )
    and exists (
      select 1 from public.items
      where items.id = matches.lost_item_id and items.type = 'lost' and items.deleted_at is null
    )
    and exists (
      select 1 from public.items
      where items.id = matches.found_item_id and items.type = 'found' and items.deleted_at is null
    )
    and public.compute_match_score(matches.lost_item_id, matches.found_item_id) >= 80
    and matches.match_percent <= public.compute_match_score(matches.lost_item_id, matches.found_item_id)
    and public.claimant_attempt_count(
      (select user_id from public.items where items.id = matches.lost_item_id),
      matches.found_item_id
    ) < 3
  );
