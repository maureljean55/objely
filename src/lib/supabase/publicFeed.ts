import { createClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";
import type { Item } from "@/lib/supabase/items";

// Same reasoning as faq.ts: this feed is identical for every visitor (no
// RLS filtering by user), so it's cached instead of hitting Supabase on
// every home page load. A plain (cookie-free) client is required to run
// inside unstable_cache, which forbids reading cookies/headers.
const publicSupabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);

// Shows only items that have actually been given back (status "returned",
// set once both sides confirm the restitution — see confirm_restitution in
// supabase/migrations/20260914100000_restitution_appointments.sql), not
// found items still awaiting a claim. A live feed of unclaimed found items
// with their real-ish location/category is exactly the kind of target the
// matching-abuse fixes above are about — showing only already-resolved
// cases keeps the home page's public feed from doubling as that target,
// while still building trust ("Objely actually returns things").
export const listRecentFinds = unstable_cache(
  async (limit: number) =>
    publicSupabase
      .from("items_public")
      .select("*")
      .eq("type", "found")
      .eq("status", "returned")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(limit)
      .returns<Item[]>(),
  ["recent-finds"],
  { revalidate: 60 },
);
