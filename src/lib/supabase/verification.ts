import { createClient } from "@/lib/supabase/client";
import { notifyMatchParticipants } from "@/lib/supabase/notifications";
import { incrementTrustScore } from "@/lib/supabase/profile";
import type { Item } from "@/lib/supabase/items";

// Bigger than the found-item bonus (see items.ts) — this is the finder
// actually seeing a restitution through, not just reporting a find.
const RESTITUTION_TRUST_BONUS = 20;

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
    .select("lost_item_id, found_item_id, lost_item:items!matches_lost_item_id_fkey(user_id, title), found_item:items!matches_found_item_id_fkey(user_id, title)")
    .single<{
      lost_item_id: string;
      found_item_id: string;
      lost_item: Pick<Item, "user_id" | "title">;
      found_item: Pick<Item, "user_id" | "title">;
    }>();

  if (!error && match) {
    if (approved) {
      await Promise.all([
        supabase.from("items").update({ status: "recovered" }).eq("id", match.lost_item_id),
        supabase.from("items").update({ status: "returned" }).eq("id", match.found_item_id),
        incrementTrustScore(RESTITUTION_TRUST_BONUS),
      ]);
    }

    await notifyMatchParticipants(
      match.lost_item.user_id,
      match.found_item.user_id,
      approved ? "verification_confirmed" : "verification_rejected",
      approved ? "Correspondance confirmée !" : "Correspondance refusée",
      approved
        ? `La restitution de "${match.found_item.title}" a été confirmée.`
        : `La correspondance pour "${match.lost_item.title}" a été refusée.`,
      matchId,
    );
  }

  return { error };
}
