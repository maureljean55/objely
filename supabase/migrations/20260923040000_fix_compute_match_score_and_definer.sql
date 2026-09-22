-- Two more fallouts from moving location off items
-- (20260923010000_protect_item_location.sql), found by continuing the
-- penetration test:
--
-- 1. compute_match_score — the function the matches INSERT policy itself
--    calls to verify a claimed match_percent is real — still referenced
--    li.location/fi.location directly and was never caught by the earlier
--    fix (20260923030000 only touched find_best_match_candidate and
--    explain_match_criteria). Since this function gates every match
--    creation, EVERY attempt to create a match has been failing outright
--    since the location migration landed. Severity: total breakage of the
--    core matching feature, not just a privacy nuance.
--
-- 2. All three scoring functions need to be SECURITY DEFINER now that
--    item_locations actually has row-level access rules (it didn't
--    before — that was the vulnerability). None of them check auth.uid()
--    or expose the raw location text (only a score/boolean signal), so
--    reading item_locations with elevated privilege here is the same safe,
--    scoped pattern as get_match_participant_profile — but running as
--    SECURITY INVOKER (the default) means a claimant scoring a match
--    against someone else's not-yet-related, hide_exact_location item
--    can't see that item's row in item_locations at all, silently losing
--    the location-match signal (and, for compute_match_score, potentially
--    failing a real match that should score >= 80) — a correctness
--    regression on top of the earlier hard failure.

create or replace function public.compute_match_score(p_lost_item_id uuid, p_found_item_id uuid)
returns smallint
language sql
stable
security definer
set search_path = public
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
      + (case when lil.location is not null and fil.location is not null and (
            select count(*) from (
              select w from unnest(public.normalize_words(lil.location)) w
              intersect
              select w from unnest(public.normalize_words(fil.location)) w
            ) shared
          ) >= 2 then 20 else 0 end)
      + (case when li.occurred_on is not null and fi.occurred_on is not null
              and abs(li.occurred_on - fi.occurred_on) <= 5 then 20 else 0 end)
    , 100)::smallint
  end
  from public.items li
  cross join public.items fi
  left join public.item_locations lil on lil.item_id = li.id
  left join public.item_locations fil on fil.item_id = fi.id
  where li.id = p_lost_item_id and fi.id = p_found_item_id
$$;

revoke all on function public.compute_match_score(uuid, uuid) from public;
grant execute on function public.compute_match_score(uuid, uuid) to authenticated;

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
security definer
set search_path = public
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
  left join public.item_locations fil on fil.item_id = fi.id
  cross join lateral (
    select
      (p_colors is not null and fi.colors is not null and exists (
        select 1 from unnest(p_colors) c1 join unnest(fi.colors) c2
          on lower(trim(c1)) = lower(trim(c2))
      )) as colors_matched,
      (p_brand is not null and fi.brand is not null
        and lower(trim(p_brand)) = lower(trim(fi.brand))) as brand_matched,
      (p_location is not null and fil.location is not null and (
        select count(*) from (
          select w from unnest(public.normalize_words(p_location)) w
          intersect
          select w from unnest(public.normalize_words(fil.location)) w
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

revoke all on function public.find_best_match_candidate(text, text[], text, text, date, public.item_type) from public;
grant execute on function public.find_best_match_candidate(text, text[], text, text, date, public.item_type) to authenticated;

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
security definer
set search_path = public
as $$
  select
    li.category_id = fi.category_id,
    (li.colors is not null and fi.colors is not null and exists (
      select 1 from unnest(li.colors) c1 join unnest(fi.colors) c2
        on lower(trim(c1)) = lower(trim(c2))
    )),
    (li.brand is not null and fi.brand is not null
      and lower(trim(li.brand)) = lower(trim(fi.brand))),
    (lil.location is not null and fil.location is not null and (
      select count(*) from (
        select w from unnest(public.normalize_words(lil.location)) w
        intersect
        select w from unnest(public.normalize_words(fil.location)) w
      ) shared
    ) >= 2),
    (li.occurred_on is not null and fi.occurred_on is not null
      and abs(li.occurred_on - fi.occurred_on) <= 5)
  from public.items li
  cross join public.items fi
  left join public.item_locations lil on lil.item_id = li.id
  left join public.item_locations fil on fil.item_id = fi.id
  where li.id = p_lost_item_id and fi.id = p_found_item_id
$$;

revoke all on function public.explain_match_criteria(uuid, uuid) from public;
grant execute on function public.explain_match_criteria(uuid, uuid) to authenticated;
