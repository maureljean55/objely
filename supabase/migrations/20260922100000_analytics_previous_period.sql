-- Adds a "previous period" comparison to the analytics dashboard: same
-- length window, immediately preceding the current one, so each KPI tile
-- can show a real "+12% vs période précédente" instead of a bare number.
create or replace function public.get_analytics_summary(p_days integer default 30)
returns jsonb
language sql
security definer
set search_path = public
stable
as $$
  with bounds as (
    select
      now() - (p_days || ' days')::interval as current_since,
      now() - ((p_days * 2) || ' days')::interval as previous_since,
      (now() at time zone 'Europe/Paris')::date as today_local
  ),
  current_scoped as (
    select pv.path, pv.user_id, pv.created_at at time zone 'Europe/Paris' as created_local
    from public.page_views pv, bounds
    where pv.created_at >= bounds.current_since
  ),
  previous_scoped as (
    select pv.path, pv.user_id, pv.created_at at time zone 'Europe/Paris' as created_local
    from public.page_views pv, bounds
    where pv.created_at >= bounds.previous_since and pv.created_at < bounds.current_since
  ),
  current_totals as (
    select count(*) as total_visits, count(distinct user_id) as unique_visitors from current_scoped
  ),
  previous_totals as (
    select count(*) as total_visits, count(distinct user_id) as unique_visitors from previous_scoped
  ),
  current_top_pages as (
    select path, count(*) as visits from current_scoped group by path order by count(*) desc, path limit 12
  ),
  previous_top_pages as (
    select path, count(*) as visits from previous_scoped group by path
  ),
  days as (
    select generate_series((select today_local from bounds) - (p_days - 1), (select today_local from bounds), interval '1 day')::date as day
  ),
  daily as (
    select d.day, count(current_scoped.path) as visits
    from days d
    left join current_scoped on date(current_scoped.created_local) = d.day
    group by d.day
    order by d.day
  ),
  hours as (
    select generate_series(0, 23) as hour
  ),
  current_hourly as (
    select h.hour, count(current_scoped.path) as visits
    from hours h
    left join current_scoped on extract(hour from current_scoped.created_local)::int = h.hour
    group by h.hour
    order by h.hour
  ),
  previous_hourly as (
    select h.hour, count(previous_scoped.path) as visits
    from hours h
    left join previous_scoped on extract(hour from previous_scoped.created_local)::int = h.hour
    group by h.hour
    order by h.hour
  )
  select jsonb_build_object(
    'totalVisits', (select total_visits from current_totals),
    'uniqueVisitors', (select unique_visitors from current_totals),
    'topPages', (select coalesce(jsonb_agg(jsonb_build_object('path', path, 'visits', visits)), '[]'::jsonb) from current_top_pages),
    'daily', (select coalesce(jsonb_agg(jsonb_build_object('day', day, 'visits', visits)), '[]'::jsonb) from daily),
    'hourly', (select coalesce(jsonb_agg(jsonb_build_object('hour', hour, 'visits', visits)), '[]'::jsonb) from current_hourly),
    'previous', jsonb_build_object(
      'totalVisits', (select total_visits from previous_totals),
      'uniqueVisitors', (select unique_visitors from previous_totals),
      'topPages', (select coalesce(jsonb_agg(jsonb_build_object('path', path, 'visits', visits)), '[]'::jsonb) from previous_top_pages),
      'hourly', (select coalesce(jsonb_agg(jsonb_build_object('hour', hour, 'visits', visits)), '[]'::jsonb) from previous_hourly)
    )
  );
$$;
