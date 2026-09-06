import { createClient } from "@/lib/supabase/client";

export type MatchVerification = {
  id: string;
  match_id: string;
  submitted_by: string;
  brand_answer: string | null;
  detail_answer: string | null;
  created_at: string;
};

export async function submitVerificationAnswers(matchId: string, brandAnswer: string, detailAnswer: string) {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return { data: null, error: new Error("Vous devez être connecté.") };

  return supabase
    .from("match_verifications")
    .insert({ match_id: matchId, submitted_by: user.id, brand_answer: brandAnswer, detail_answer: detailAnswer })
    .select()
    .single<MatchVerification>();
}

export async function getLatestVerification(matchId: string) {
  const supabase = createClient();
  return supabase
    .from("match_verifications")
    .select("*")
    .eq("match_id", matchId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<MatchVerification>();
}

export async function resolveMatch(matchId: string, approved: boolean) {
  const supabase = createClient();
  const { data: match, error } = await supabase
    .from("matches")
    .update({ status: approved ? "confirmed" : "rejected" })
    .eq("id", matchId)
    .select("lost_item_id, found_item_id")
    .single();

  if (!error && match && approved) {
    await supabase.from("items").update({ status: "recovered" }).eq("id", match.lost_item_id);
    await supabase.from("items").update({ status: "returned" }).eq("id", match.found_item_id);
  }

  return { error };
}
