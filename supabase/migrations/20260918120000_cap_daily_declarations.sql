-- Anti-spam: nothing capped how many "lost"/"found" declarations a single
-- account could create. Beyond the two brute-force caps just added
-- (20260918100000, 20260918110000, which limit attempts against a specific
-- item), an account with no daily cap at all could still mass-produce
-- declarations to widen its net of fabricated items available for
-- matching. Cap it to 2 declarations (either type) per rolling 24h window.

create or replace function public.user_items_created_in_last_24h(p_user_id uuid)
returns integer
language sql
stable
as $$
  select count(*)::int
  from public.items
  where user_id = p_user_id
    and created_at > now() - interval '24 hours'
$$;

drop policy "Users can insert their own items" on public.items;

create policy "Users can insert their own items"
  on public.items for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and public.user_items_created_in_last_24h(auth.uid()) < 2
  );
