-- Identity verification gate: an account can't create a lost/found
-- declaration until its identity document has been approved (see
-- 20260921020000_identity_verification.sql). Same split as the daily cap
-- below it: RLS is the real enforcement, the client does a friendlier
-- pre-check so the error message can be specific.

drop policy "Users can insert their own items" on public.items;

create policy "Users can insert their own items"
  on public.items for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and public.user_items_created_in_last_24h(auth.uid()) < 2
    and exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.identity_verified_at is not null
    )
  );
