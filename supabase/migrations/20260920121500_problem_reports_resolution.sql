-- Lets the admin portal mark a signalement as handled. Nullable and
-- additive only — the main app's insert-only problem_reports flow (see
-- src/lib/supabase/reports.ts) never sets this, it's admin-only.
alter table public.problem_reports
  add column resolved_at timestamptz,
  add column resolved_by text;
