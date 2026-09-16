import { createClient } from "@/lib/supabase/client";
import { notifyMatchParticipant } from "@/lib/supabase/notifications";
import { getMatch } from "@/lib/supabase/messages";

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
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user ?? null;
  if (!user) return { data: null, error: new Error("Vous devez être connecté.") };

  const { data: existingMatch } = await getMatch(matchId);
  if (existingMatch && existingMatch.status !== "pending") {
    return { data: null, error: new Error("Cette correspondance a déjà été traitée.") };
  }

  const result = await supabase
    .from("match_verifications")
    .insert({ match_id: matchId, submitted_by: user.id, brand_answer: brandAnswer, detail_answer: detailAnswer })
    .select()
    .single<MatchVerification>();

  if (!result.error) await notifyMatchParticipant(matchId, "verification_submitted");

  return result;
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

// The actual matches/items updates run inside the resolve_match() Postgres
// function (security definer) — a plain client-side update can't touch the
// item the caller doesn't own, which is exactly what approving/rejecting
// needs to do to the *other* participant's item. See its migration
// (20260914100000) for why: confirming only unlocks chat now — items stay
// "matched" until both sides confirm the restitution actually happened via
// confirmRestitution(), not the moment identity is verified.
export async function resolveMatch(matchId: string, approved: boolean) {
  const supabase = createClient();
  const { error } = await supabase.rpc("resolve_match", { p_match_id: matchId, p_approved: approved });

  // Only the person who lost the item needs telling — the finder is the one
  // who just took this action, so notifying them back would be noise.
  // notify_match_participant always targets "the other participant", which
  // from the finder's own call here is exactly the lost-item owner.
  if (!error) await notifyMatchParticipant(matchId, approved ? "verification_confirmed" : "verification_rejected");

  return { error };
}
