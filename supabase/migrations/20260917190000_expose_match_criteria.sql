-- Functional bug (matching-feature audit, part 3): the "critères de
-- correspondance" checklist shown alongside a match's score
-- (src/lib/supabase/matching.ts's explainMatch/explainItemMatch) recomputed
-- each criterion client-side from the ITEM OBJECT it was given — but that
-- item now frequently comes from items_public (see
-- 20260917180000_enforce_hide_exact_location.sql), which serves a
-- coarsened/placeholder location instead of the real one pre-confirmation.
-- The actual score was computed server-side against the REAL location, so
-- the checklist could show "Zone proche" unchecked (or wrongly checked)
-- even though location genuinely was (or wasn't) one of the signals behind
-- the score just shown next to it.
--
-- Fix: compute the criteria server-side, from the same real data the score
-- itself is computed from, and return booleans only (never the location
-- text) — so the client never needs the real address to render the
-- checklist correctly.

-- Postgres refuses to change a function's OUT-parameter row type via
-- CREATE OR REPLACE — drop it first.
drop function if exists public.find_best_match_candidate(text, text[], text, text, date, public.item_type);

create function public.find_best_match_candidate(
  p_category_id text,
  p_colors text[],
  p_brand text,
  p_location text,
  p_occurred_on date,
  p_opposite_type public.item_type
)
returns table (
  item_id uuid,
  score smallint,
  colors_matched boolean,
  brand_matched boolean,
  location_matched boolean,
  date_matched boolean
)
language sql
stable
as $$
  select
    fi.id as item_id,
    least(
      20
      + (case when crit.colors_matched then 20 else 0 end)
      + (case when crit.brand_matched then 20 else 0 end)
      + (case when crit.location_matched then 20 else 0 end)
      + (case when crit.date_matched then 20 else 0 end)
    , 100)::smallint as score,
    crit.colors_matched,
    crit.brand_matched,
    crit.location_matched,
    crit.date_matched
  from public.items fi
  cross join lateral (
    select
      (p_colors is not null and fi.colors is not null and exists (
        select 1 from unnest(p_colors) c1 join unnest(fi.colors) c2
          on lower(trim(c1)) = lower(trim(c2))
      )) as colors_matched,
      (p_brand is not null and fi.brand is not null
        and lower(trim(p_brand)) = lower(trim(fi.brand))) as brand_matched,
      (p_location is not null and fi.location is not null and (
        select count(*) from (
          select w from unnest(public.normalize_words(p_location)) w
          intersect
          select w from unnest(public.normalize_words(fi.location)) w
        ) shared
      ) >= 2) as location_matched,
      (p_occurred_on is not null and fi.occurred_on is not null
        and abs(fi.occurred_on - p_occurred_on) <= 5) as date_matched
  ) crit
  where fi.type = p_opposite_type
    and fi.category_id = p_category_id
    and fi.status in ('searching', 'matched')
    and fi.deleted_at is null
  order by score desc
  limit 1
$$;

-- Same breakdown, but for two already-declared items (activity/match page,
-- reviewing a proposed or confirmed match).
create or replace function public.explain_match_criteria(p_lost_item_id uuid, p_found_item_id uuid)
returns table (
  category_matched boolean,
  colors_matched boolean,
  brand_matched boolean,
  location_matched boolean,
  date_matched boolean
)
language sql
stable
as $$
  select
    li.category_id = fi.category_id,
    (li.colors is not null and fi.colors is not null and exists (
      select 1 from unnest(li.colors) c1 join unnest(fi.colors) c2
        on lower(trim(c1)) = lower(trim(c2))
    )),
    (li.brand is not null and fi.brand is not null
      and lower(trim(li.brand)) = lower(trim(fi.brand))),
    (li.location is not null and fi.location is not null and (
      select count(*) from (
        select w from unnest(public.normalize_words(li.location)) w
        intersect
        select w from unnest(public.normalize_words(fi.location)) w
      ) shared
    ) >= 2),
    (li.occurred_on is not null and fi.occurred_on is not null
      and abs(li.occurred_on - fi.occurred_on) <= 5)
  from public.items li, public.items fi
  where li.id = p_lost_item_id and fi.id = p_found_item_id
$$;
