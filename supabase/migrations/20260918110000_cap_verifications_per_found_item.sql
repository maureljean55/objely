-- Anti-fraud hardening, other side of 20260918100000_cap_match_attempts_per_claimant.sql:
-- that migration capped how many attempts a single claimant gets against
-- one found item, but nothing capped how many DIFFERENT claimants a single
-- found item can accumulate verification answers from. Since a match only
-- needs a found item to superficially resemble a real lost declaration
-- (same category + attributes a claimant could invent), a bad-faith found-
-- item declaration could otherwise be used to harvest private
-- brand/detail answers from many different real victims who each believed
-- it might be their item.
--
-- Cap it: once a found item already has verification answers on file from
-- MAX_CLAIMANTS distinct claimants, no new claimant can submit another —
-- the finder should resolve (confirm/reject) the pending ones first.

create or replace function public.found_item_distinct_claimant_count(p_found_item_id uuid, p_exclude_claimant uuid)
returns integer
language sql
stable
as $$
  select count(distinct li.user_id)::int
  from public.match_verifications mv
  join public.matches m on m.id = mv.match_id
  join public.items li on li.id = m.lost_item_id
  where m.found_item_id = p_found_item_id
    and li.user_id <> p_exclude_claimant
$$;

drop policy "The lost-item owner can submit verification answers" on public.match_verifications;

create policy "The lost-item owner can submit verification answers"
  on public.match_verifications for insert
  to authenticated
  with check (
    auth.uid() = submitted_by
    and exists (
      select 1 from public.matches
      join public.items li on li.id = matches.lost_item_id
      where matches.id = match_verifications.match_id
        and li.user_id = auth.uid()
    )
    and public.found_item_distinct_claimant_count(
      (select found_item_id from public.matches where matches.id = match_verifications.match_id),
      auth.uid()
    ) < 5
  );
