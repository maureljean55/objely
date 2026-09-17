import { createClient } from "@/lib/supabase/client";
import type { DeclarationDraft } from "@/lib/declarationDraft";
import type { Item, ItemType } from "@/lib/supabase/items";
import { notifyMatchCreated } from "@/lib/supabase/notifications";

// Kept in sync with compute_match_score/find_best_match_candidate in
// supabase/migrations/20260917150000_stricter_match_scoring.sql and
// 20260917160000_require_three_match_signals.sql: category plus a single
// weak secondary signal (e.g. one shared word in a freeform location field)
// used to be enough to pass, which let coincidental pairs reach the
// ownership-verification step. Uniform 20-point weights across
// category/colors/brand/location/date mean the threshold is only reachable
// with the category plus at least 3 of the 4 secondary signals.
const MATCH_THRESHOLD = 80;

type DraftLike = Pick<DeclarationDraft, "categoryId" | "colors" | "brand" | "location" | "date">;

export type MatchCriterion = { label: string; matched: boolean };

type CriteriaFlags = {
  colors_matched: boolean;
  brand_matched: boolean;
  location_matched: boolean;
  date_matched: boolean;
};

// category_matched isn't part of CriteriaFlags: find_best_match_candidate's
// candidates are already pre-filtered to the caller's category, so it has
// nothing to report there — only explain_match_criteria (two already-
// declared items, which could in principle differ) returns it.
function toCriteria(flags: CriteriaFlags, categoryMatched: boolean): MatchCriterion[] {
  return [
    { label: "Même catégorie", matched: categoryMatched },
    { label: "Couleur similaire", matched: flags.colors_matched },
    { label: "Marque similaire", matched: flags.brand_matched },
    { label: "Zone proche", matched: flags.location_matched },
    { label: "Date compatible", matched: flags.date_matched },
  ];
}

/**
 * Breakdown of why two already-declared items matched (or didn't) — e.g. for
 * an existing match's detail page. Computed server-side (explain_match_criteria
 * reads the real, unredacted items) so it can't disagree with the score,
 * and the client never needs the real location just to render checkmarks.
 */
export async function explainItemMatch(lostItemId: string, foundItemId: string): Promise<MatchCriterion[]> {
  const supabase = createClient();
  const { data } = await supabase
    .rpc("explain_match_criteria", { p_lost_item_id: lostItemId, p_found_item_id: foundItemId })
    .single<CriteriaFlags & { category_matched: boolean }>();
  if (!data) return [];
  return toCriteria(data, data.category_matched);
}

export type MatchCandidate = { item: Item; score: number; criteria: MatchCriterion[] };

/**
 * Looks for the best existing item of the opposite type that could match
 * this draft. `oppositeType` is "found" when declaring a lost item, and
 * "lost" when declaring a found item.
 *
 * The scoring itself (same rules as compute_match_score in the DB) runs in
 * Postgres via RPC, so only the single best candidate's id ever crosses the
 * network instead of every same-category item in the whole table.
 */
export async function findBestMatch(draft: DraftLike, oppositeType: ItemType): Promise<MatchCandidate | null> {
  const supabase = createClient();
  const { data: best } = await supabase
    .rpc("find_best_match_candidate", {
      p_category_id: draft.categoryId ?? null,
      p_colors: draft.colors && draft.colors.length > 0 ? draft.colors : null,
      p_brand: draft.brand || null,
      p_location: draft.location || null,
      p_occurred_on: draft.date || null,
      p_opposite_type: oppositeType,
    })
    .maybeSingle<{ item_id: string; score: number } & CriteriaFlags>();

  if (!best || best.score < MATCH_THRESHOLD) return null;

  // items_public, not items directly: this candidate is shown before any
  // match/verification exists, so a hide_exact_location item must still
  // only reveal its coarse location here. The criteria below come from the
  // RPC above (computed against the real location server-side), not from
  // this possibly-redacted item, so they stay accurate either way.
  const { data: item } = await supabase.from("items_public").select("*").eq("id", best.item_id).single<Item>();
  if (!item) return null;

  return { item, score: best.score, criteria: toCriteria(best, true) };
}

type MatchParty = Pick<Item, "id" | "user_id" | "title">;

/**
 * Records a match between a lost item and a found item, flips both to
 * "matched" status, and notifies both owners. Safe to call more than once
 * for the same pair (the unique constraint on the table makes the insert a
 * no-op via upsert).
 */
export async function createMatch(lostItem: MatchParty, foundItem: MatchParty, matchPercent: number) {
  const supabase = createClient();

  const { data: match, error } = await supabase
    .from("matches")
    .upsert(
      { lost_item_id: lostItem.id, found_item_id: foundItem.id, match_percent: matchPercent },
      { onConflict: "lost_item_id,found_item_id" },
    )
    .select()
    .single<{ id: string; lost_item_id: string; found_item_id: string; match_percent: number }>();

  if (!error && match) {
    // A plain client-side .update() here only ever affects the caller's own
    // item — "Users can update their own items" (auth.uid() = user_id) RLS
    // silently drops the other party's row instead of erroring. Both items
    // need flipping regardless of which side's client happens to call
    // createMatch, so this goes through a security-definer RPC instead.
    await Promise.all([supabase.rpc("mark_match_items_matched", { p_match_id: match.id }), notifyMatchCreated(match.id)]);
  }

  return { data: match, error };
}
