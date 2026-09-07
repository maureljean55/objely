import { createClient } from "@/lib/supabase/server";

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
};

export async function listFaqItems() {
  const supabase = await createClient();
  return supabase.from("faq_items").select("*").order("sort_order", { ascending: true }).returns<FaqItem[]>();
}
