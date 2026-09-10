-- The home page's "recently found" feed (src/lib/supabase/publicFeed.ts) is
-- fetched through a plain, cookie-free Supabase client so it can be cached
-- with unstable_cache — that client always runs as the `anon` role, even
-- when the visiting browser has a logged-in session. The items SELECT
-- policy only granted `authenticated`, so every one of those cached queries
-- silently returned zero rows and the feed looked empty for all visitors.
--
-- Scope this to exactly what the feed queries (found items, not soft-
-- deleted) rather than mirroring the broader authenticated policy, since
-- lost-item listings and deleted items have no reason to be public.
create policy "Found items are viewable by anyone"
  on public.items for select
  to anon
  using (type = 'found' and deleted_at is null);
