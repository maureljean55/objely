import { createClient } from "@/lib/supabase/client";
import type { DeclarationDraft } from "@/lib/declarationDraft";
import type { Item, ItemType } from "@/lib/supabase/items";
import { notifyMatchParticipants } from "@/lib/supabase/notifications";

const MATCH_THRESHOLD = 45;

type DraftLike = Pick<DeclarationDraft, "categoryId" | "colors" | "brand" | "location" | "date">;

// An item can have multiple colors, so a match means any shared color
// between the two lists rather than requiring an exact single value.
function colorsOverlap(a: string[] | null | undefined, b: string[] | null | undefined): boolean {
  if (!a || !b || a.length === 0 || b.length === 0) return false;
  const setA = new Set(a.map((c) => c.trim().toLowerCase()));
  return b.some((c) => setA.has(c.trim().toLowerCase()));
}

function normalizeWords(text: string): string[] {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 2);
}

export type MatchCriterion = { label: string; matched: boolean };

/** Human-readable breakdown of why (or why not) a draft matches an item. */
export function explainMatch(draft: DraftLike, item: Item): MatchCriterion[] {
  const colorMatch = colorsOverlap(draft.colors, item.colors);
  const brandMatch = !!(draft.brand && item.brand && draft.brand.trim().toLowerCase() === item.brand.trim().toLowerCase());
  const locationMatch = !!(
    draft.location &&
    item.location &&
    normalizeWords(draft.location).some((word) => normalizeWords(item.location!).includes(word))
  );
  const dateMatch = !!(
    draft.date &&
    item.occurred_on &&
    Math.abs(new Date(draft.date).getTime() - new Date(item.occurred_on).getTime()) / 86_400_000 <= 14
  );

  return [
    { label: "Même catégorie", matched: draft.categoryId === item.category_id },
    { label: "Couleur similaire", matched: colorMatch },
    { label: "Marque similaire", matched: brandMatch },
    { label: "Zone proche", matched: locationMatch },
    { label: "Date compatible", matched: dateMatch },
  ];
}

/** Same breakdown as explainMatch, but for two already-declared items (e.g. an existing match). */
export function explainItemMatch(a: Item, b: Item): MatchCriterion[] {
  const colorMatch = colorsOverlap(a.colors, b.colors);
  const brandMatch = !!(a.brand && b.brand && a.brand.trim().toLowerCase() === b.brand.trim().toLowerCase());
  const locationMatch = !!(a.location && b.location && normalizeWords(a.location).some((word) => normalizeWords(b.location!).includes(word)));
  const dateMatch = !!(
    a.occurred_on &&
    b.occurred_on &&
    Math.abs(new Date(a.occurred_on).getTime() - new Date(b.occurred_on).getTime()) / 86_400_000 <= 14
  );

  return [
    { label: "Même catégorie", matched: a.category_id === b.category_id },
    { label: "Couleur similaire", matched: colorMatch },
    { label: "Marque similaire", matched: brandMatch },
    { label: "Zone proche", matched: locationMatch },
    { label: "Date compatible", matched: dateMatch },
  ];
}

export type MatchCandidate = { item: Item; score: number };

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
    .maybeSingle<{ item_id: string; score: number }>();

  if (!best || best.score < MATCH_THRESHOLD) return null;

  const { data: item } = await supabase.from("items").select("*").eq("id", best.item_id).single<Item>();
  if (!item) return null;

  return { item, score: best.score };
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
    await Promise.all([
      supabase.from("items").update({ status: "matched" }).in("id", [lostItem.id, foundItem.id]),
      notifyMatchParticipants(
        lostItem.user_id,
        foundItem.user_id,
        "match",
        "Une correspondance a été trouvée !",
        `"${lostItem.title}" pourrait correspondre à "${foundItem.title}".`,
        match.id,
      ),
    ]);
  }

  return { data: match, error };
}
