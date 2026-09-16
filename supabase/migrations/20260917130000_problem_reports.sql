-- "Signaler un problème" (profile/report) previously just showed a fake
-- success message via setTimeout and never persisted anything — a report
-- about a scam/fake object/bug vanished the moment the page closed. This
-- table gives it somewhere real to land.
create table public.problem_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users(id) on delete cascade,
  category text not null check (category in ('tech', 'fake', 'info', 'other')),
  description text not null,
  item_id uuid references public.items(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.problem_reports enable row level security;

create policy "Users can submit their own reports"
  on public.problem_reports for insert
  to authenticated
  with check (reporter_id = auth.uid());

create policy "Users can view their own reports"
  on public.problem_reports for select
  to authenticated
  using (reporter_id = auth.uid());
