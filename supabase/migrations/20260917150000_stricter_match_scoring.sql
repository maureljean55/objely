-- The match score was too easy to trigger: same category alone was worth
-- 40/100, and the threshold was 45, so any single weak secondary signal
-- (one shared word in the location, dates within a loose 14-day window)
-- pushed a same-category pair over the line. That let low-quality/coincidental
-- pairs reach the ownership-verification step, which is exactly where a bad-
-- faith claimant could try their luck. Rework both scoring functions
-- (mirrors of each other — see src/lib/supabase/matching.ts) so a match
-- needs the category plus at least two solid secondary signals:
--   - weights are now uniform (20 each for category/colors/brand/location/
--     date, summing to 100) instead of 40 + 15 each, so no single secondary
--     signal can carry a same-category pair over the threshold alone.
--   - the date window drops from 14 days to 5.
--   - the location check now requires at least 2 shared words, not just 1
--     (a single shared word like "paris" or "rue" was matching unrelated
--     addresses).
--   - the pass threshold moves from 45 to 60, which is only reachable with
--     the category plus at least 2 of the 4 secondary signals.

create or replace function public.compute_match_score(p_lost_item_id uuid, p_found_item_id uuid)
returns smallint
language sql
stable
as $$
  select case
    when li.category_id is distinct from fi.category_id then 0::smallint
    else least(
      20
      + (case when li.colors is not null and fi.colors is not null and exists (
            select 1 from unnest(li.colors) c1 join unnest(fi.colors) c2
              on lower(trim(c1)) = lower(trim(c2))
          ) then 20 else 0 end)
      + (case when li.brand is not null and fi.brand is not null
              and lower(trim(li.brand)) = lower(trim(fi.brand)) then 20 else 0 end)
      + (case when li.location is not null and fi.location is not null and (
            select count(*) from (
              select w from unnest(public.normalize_words(li.location)) w
              intersect
              select w from unnest(public.normalize_words(fi.location)) w
            ) shared
          ) >= 2 then 20 else 0 end)
      + (case when li.occurred_on is not null and fi.occurred_on is not null
              and abs(li.occurred_on - fi.occurred_on) <= 5 then 20 else 0 end)
    , 100)::smallint
  end
  from public.items li, public.items fi
  where li.id = p_lost_item_id and fi.id = p_found_item_id
$$;

create or replace function public.find_best_match_candidate(
  p_category_id text,
  p_colors text[],
  p_brand text,
  p_location text,
  p_occurred_on date,
  p_opposite_type public.item_type
)
returns table (item_id uuid, score smallint)
language sql
stable
as $$
  select
    fi.id as item_id,
    least(
      20
      + (case when p_colors is not null and fi.colors is not null and exists (
            select 1 from unnest(p_colors) c1 join unnest(fi.colors) c2
              on lower(trim(c1)) = lower(trim(c2))
          ) then 20 else 0 end)
      + (case when p_brand is not null and fi.brand is not null
              and lower(trim(p_brand)) = lower(trim(fi.brand)) then 20 else 0 end)
      + (case when p_location is not null and fi.location is not null and (
            select count(*) from (
              select w from unnest(public.normalize_words(p_location)) w
              intersect
              select w from unnest(public.normalize_words(fi.location)) w
            ) shared
          ) >= 2 then 20 else 0 end)
      + (case when p_occurred_on is not null and fi.occurred_on is not null
              and abs(fi.occurred_on - p_occurred_on) <= 5 then 20 else 0 end)
    , 100)::smallint as score
  from public.items fi
  where fi.type = p_opposite_type
    and fi.category_id = p_category_id
    and fi.status in ('searching', 'matched')
    and fi.deleted_at is null
  order by score desc
  limit 1
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
    and public.compute_match_score(matches.lost_item_id, matches.found_item_id) >= 60
    and matches.match_percent <= public.compute_match_score(matches.lost_item_id, matches.found_item_id)
  );
