-- One-off cleanup: accounts created before trust_score defaulted to 0 (see
-- 20260907111212) still carry the old default. Reset anyone who hasn't
-- earned any real trust yet — i.e. never declared a found item — back to 0,
-- so they show as "Nouveau" like any other unproven account. Users who have
-- declared a found item keep whatever score they've already earned.
update public.profiles
set trust_score = 0
where id not in (
  select distinct user_id from public.items where type = 'found'
);
