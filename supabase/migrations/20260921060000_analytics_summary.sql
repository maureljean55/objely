-- Single round-trip aggregate for the admin analytics dashboard: total
-- visits, unique visitors, top pages, a full daily series (zero-filled) and
-- a full 24h-of-day series (zero-filled), all bucketed in Europe/Paris local
-- time since that's the timezone the admins reading the chart are in.
create or replace function public.get_analytics_summary(p_days integer default 30)
returns jsonb
language sql
security definer
set search_path = public
stable
as $$
  with bounds as (
    select
      now() - (p_days || ' days')::interval as since,
      (now() at time zone 'Europe/Paris')::date as today_local
  ),
  scoped as (
    select pv.path, pv.user_id, pv.created_at at time zone 'Europe/Paris' as created_local
    from public.page_views pv, bounds
    where pv.created_at >= bounds.since
  ),
  totals as (
    select count(*) as total_visits, count(distinct user_id) as unique_visitors from scoped
  ),
  top_pages as (
    select path, count(*) as visits
    from scoped
    group by path
    order by count(*) desc, path
    limit 12
  ),
  days as (
    select generate_series((select today_local from bounds) - (p_days - 1), (select today_local from bounds), interval '1 day')::date as day
  ),
  daily as (
    select d.day, count(scoped.path) as visits
    from days d
    left join scoped on date(scoped.created_local) = d.day
    group by d.day
    order by d.day
  ),
  hours as (
    select generate_series(0, 23) as hour
  ),
  hourly as (
    select h.hour, count(scoped.path) as visits
    from hours h
    left join scoped on extract(hour from scoped.created_local)::int = h.hour
    group by h.hour
    order by h.hour
  )
  select jsonb_build_object(
    'totalVisits', (select total_visits from totals),
    'uniqueVisitors', (select unique_visitors from totals),
    'topPages', (select coalesce(jsonb_agg(jsonb_build_object('path', path, 'visits', visits)), '[]'::jsonb) from top_pages),
    'daily', (select coalesce(jsonb_agg(jsonb_build_object('day', day, 'visits', visits)), '[]'::jsonb) from daily),
    'hourly', (select coalesce(jsonb_agg(jsonb_build_object('hour', hour, 'visits', visits)), '[]'::jsonb) from hourly)
  );
$$;

revoke all on function public.get_analytics_summary(integer) from public;
grant execute on function public.get_analytics_summary(integer) to service_role;
