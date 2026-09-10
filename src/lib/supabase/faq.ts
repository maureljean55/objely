import { createClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
};

// FAQ content is public (readable by anyone, RLS policy is `using (true)`)
// and changes rarely, so it's cached instead of hitting Supabase on every
// visit to the help page. A plain (cookie-free) client is used here so this
// can run inside unstable_cache, which forbids reading cookies/headers.
const publicSupabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);

export const listFaqItems = unstable_cache(
  async () => publicSupabase.from("faq_items").select("*").order("sort_order", { ascending: true }).returns<FaqItem[]>(),
  ["faq-items"],
  { revalidate: 300 },
);
