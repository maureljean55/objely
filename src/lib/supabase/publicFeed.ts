import { createClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";
import type { Item } from "@/lib/supabase/items";

// Same reasoning as faq.ts: this feed is identical for every visitor (no
// RLS filtering by user), so it's cached instead of hitting Supabase on
// every home page load. A plain (cookie-free) client is required to run
// inside unstable_cache, which forbids reading cookies/headers.
const publicSupabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);

export const listRecentFinds = unstable_cache(
  async (limit: number) =>
    publicSupabase
      .from("items")
      .select("*")
      .eq("type", "found")
      .in("status", ["searching", "matched"])
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(limit)
      .returns<Item[]>(),
  ["recent-finds"],
  { revalidate: 60 },
);
