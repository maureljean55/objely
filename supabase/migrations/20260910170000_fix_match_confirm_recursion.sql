-- Bug: confirming a match (the found-item owner clicking "Confirmer" after
-- reviewing the owner's verification answers) always failed with
-- "infinite recursion detected in policy for relation matches" — meaning no
-- match could ever reach "confirmed" and chat never unlocked. Reproduced
-- directly against the matches UPDATE policy added in
-- 20260908120000_secure_matches_and_trust_score.sql.
--
-- Its with-check subquery reads match_verifications to confirm an answer
-- was submitted; match_verifications' own SELECT policy reads back from
-- matches to confirm the caller is a participant. Postgres RLS doesn't
-- support this kind of A-references-B-references-A cycle — confirmed by
-- match_verifications being readable fine on its own, but not when nested
-- inside the matches UPDATE check. Break the cycle with a security-definer
-- helper that looks up the verification without going through
-- match_verifications' RLS at all (the with-check clause already verifies
-- the caller owns the found item, so nothing is being bypassed).

create or replace function public.match_has_verification(p_match_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from public.match_verifications where match_id = p_match_id);
$$;

revoke all on function public.match_has_verification(uuid) from public;
grant execute on function public.match_has_verification(uuid) to authenticated;

drop policy "Match participants can resolve a pending match" on public.matches;

create policy "Match participants can resolve a pending match"
  on public.matches for update
  to authenticated
  using (
    status = 'pending'
    and (
      exists (select 1 from public.items where items.id = matches.lost_item_id and items.user_id = auth.uid())
      or exists (select 1 from public.items where items.id = matches.found_item_id and items.user_id = auth.uid())
    )
  )
  with check (
    status = 'rejected'
    or (
      status = 'confirmed'
      and exists (select 1 from public.items where items.id = matches.found_item_id and items.user_id = auth.uid())
      and public.match_has_verification(matches.id)
    )
  );
