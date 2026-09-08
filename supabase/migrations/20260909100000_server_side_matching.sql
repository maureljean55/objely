-- Performance fix: findBestMatch() used to pull every opposite-type item in
-- the same category down to the browser (select *, no limit) and score them
-- one by one in JS. Fine at a handful of rows, but it means every "J'ai
-- perdu"/"J'ai trouvé" declaration pays for the full candidate set over the
-- network, and it never used a supporting index. Move the scoring into
-- Postgres (reusing compute_match_score's logic, adapted to compare a draft
-- against existing items) so only the single best candidate's id ever
-- leaves the database, and add the index the underlying scan actually needs.

create index items_matching_idx
  on public.items (type, category_id, status)
  where deleted_at is null;

-- Same scoring rules as scoreMatch() in src/lib/supabase/matching.ts, but
-- for a not-yet-created declaration (draft fields) against existing items —
-- the draft has no item_id yet, so this can't reuse compute_match_score()
-- as-is. Returns the single best-scoring opposite-type item, if any.
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
      40
      + (case when p_colors is not null and fi.colors is not null and exists (
            select 1 from unnest(p_colors) c1 join unnest(fi.colors) c2
              on lower(trim(c1)) = lower(trim(c2))
          ) then 15 else 0 end)
      + (case when p_brand is not null and fi.brand is not null
              and lower(trim(p_brand)) = lower(trim(fi.brand)) then 15 else 0 end)
      + (case when p_location is not null and fi.location is not null and exists (
            select 1 from unnest(public.normalize_words(p_location)) w1
            join unnest(public.normalize_words(fi.location)) w2 on w1 = w2
          ) then 15 else 0 end)
      + (case when p_occurred_on is not null and fi.occurred_on is not null
              and abs(fi.occurred_on - p_occurred_on) <= 14 then 15 else 0 end)
    , 100)::smallint as score
  from public.items fi
  where fi.type = p_opposite_type
    and fi.category_id = p_category_id
    and fi.status in ('searching', 'matched')
    and fi.deleted_at is null
  order by score desc
  limit 1
$$;
