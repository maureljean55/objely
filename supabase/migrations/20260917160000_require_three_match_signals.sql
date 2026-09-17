-- Further anti-fraud tightening (see 20260917150000_stricter_match_scoring.sql
-- for the previous step): category + any 2 of the 4 secondary signals
-- (colors/brand/location/date) was still reachable by coincidence for
-- common categories. Raise the bar so a match needs category + at least
-- 3 of the 4 secondary signals, cutting the number of candidates that
-- reach the ownership-verification step where a bad-faith claimant could
-- try their luck.
--
-- With the uniform 20-point weights from the previous migration
-- (20 category + 20 each for colors/brand/location/date, capped at 100),
-- category + 2 signals = 60 and category + 3 signals = 80. Moving the
-- threshold from 60 to 80 is exactly that: 2-of-4 no longer passes.

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
    and public.compute_match_score(matches.lost_item_id, matches.found_item_id) >= 80
    and matches.match_percent <= public.compute_match_score(matches.lost_item_id, matches.found_item_id)
  );
