import { createClient } from "@/lib/supabase/client";
import type { DeclarationDraft } from "@/lib/declarationDraft";
import type { Item, ItemType } from "@/lib/supabase/items";

const MATCH_THRESHOLD = 45;

type DraftLike = Pick<DeclarationDraft, "categoryId" | "color" | "brand" | "location" | "date">;

/**
 * Scores how likely `draft` (a lost/found declaration being created) refers
 * to the same physical object as `item` (an existing declaration of the
 * opposite type). Points are additive and deliberately simple/explainable:
 * category is the gate (no category match, no point comparing further),
 * then color/brand/location/date each add confidence.
 */
export function scoreMatch(draft: DraftLike, item: Item): number {
  if (!draft.categoryId || draft.categoryId !== item.category_id) return 0;

  let score = 40; // same category

  if (draft.color && item.color && draft.color.trim().toLowerCase() === item.color.trim().toLowerCase()) {
    score += 15;
  }

  if (draft.brand && item.brand && draft.brand.trim().toLowerCase() === item.brand.trim().toLowerCase()) {
    score += 15;
  }

  if (draft.location && item.location) {
    const a = normalizeWords(draft.location);
    const b = normalizeWords(item.location);
    if (a.some((word) => b.includes(word))) score += 15;
  }

  if (draft.date && item.occurred_on) {
    const daysApart = Math.abs(new Date(draft.date).getTime() - new Date(item.occurred_on).getTime()) / 86_400_000;
    if (daysApart <= 14) score += 15;
  }

  return Math.min(score, 100);
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
  const colorMatch = !!(draft.color && item.color && draft.color.trim().toLowerCase() === item.color.trim().toLowerCase());
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

export type MatchCandidate = { item: Item; score: number };

/**
 * Looks for the best existing item of the opposite type that could match
 * this draft. `oppositeType` is "found" when declaring a lost item, and
 * "lost" when declaring a found item.
 */
export async function findBestMatch(draft: DraftLike, oppositeType: ItemType): Promise<MatchCandidate | null> {
  const supabase = createClient();
  const { data: candidates } = await supabase
    .from("items")
    .select("*")
    .eq("type", oppositeType)
    .eq("category_id", draft.categoryId ?? "__none__")
    .in("status", ["searching", "matched"])
    .returns<Item[]>();

  if (!candidates || candidates.length === 0) return null;

  let best: MatchCandidate | null = null;
  for (const item of candidates) {
    const score = scoreMatch(draft, item);
    if (score >= MATCH_THRESHOLD && (!best || score > best.score)) {
      best = { item, score };
    }
  }

  return best;
}

/**
 * Records a match between a lost item and a found item, and flips both to
 * "matched" status. Safe to call more than once for the same pair (the
 * unique constraint on the table makes the insert a no-op via upsert).
 */
export async function createMatch(lostItemId: string, foundItemId: string, matchPercent: number) {
  const supabase = createClient();

  const { data: match, error } = await supabase
    .from("matches")
    .upsert(
      { lost_item_id: lostItemId, found_item_id: foundItemId, match_percent: matchPercent },
      { onConflict: "lost_item_id,found_item_id" },
    )
    .select()
    .single<{ id: string; lost_item_id: string; found_item_id: string; match_percent: number }>();

  if (!error) {
    await supabase.from("items").update({ status: "matched" }).in("id", [lostItemId, foundItemId]);
  }

  return { data: match, error };
}
