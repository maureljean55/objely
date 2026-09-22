import { createClient } from "@/lib/supabase/client";
import type { DeclarationDraft } from "@/lib/declarationDraft";
import { awardFoundItemTrustBonus } from "@/lib/supabase/profile";

export type ItemType = "lost" | "found";
export type ItemStatus = "searching" | "matched" | "recovered" | "returned";

export type Item = {
  id: string;
  user_id: string;
  type: ItemType;
  status: ItemStatus;
  category_id: string;
  category_label: string;
  category_icon: string | null;
  title: string;
  description: string | null;
  brand: string | null;
  colors: string[] | null;
  location: string | null;
  hide_exact_location: boolean;
  photos: string[];
  occurred_on: string | null;
  deleted_at: string | null;
  resolved_before_deletion: boolean | null;
  deletion_reason: string | null;
  created_at: string;
  updated_at: string;
};

/**
 * Folds draft fields that don't have their own column into the item's
 * public description: "Moment approximatif" and "Précisions sur le lieu"
 * (captured on report-lost/location but previously never saved anywhere),
 * plus — for lost items only — "Éléments distinctifs", since nothing ever
 * reads a lost item's item_secrets row (only found_item's secret is read,
 * in the verification flow), so keeping it there just orphaned it silently.
 */
function buildDescription(draft: DeclarationDraft, type: ItemType): string | null {
  const parts: string[] = [];
  if (draft.description?.trim()) parts.push(draft.description.trim());
  if (draft.moment?.trim()) parts.push(`Moment : ${draft.moment.trim()}`);
  if (draft.locationDetails?.trim()) parts.push(draft.locationDetails.trim());
  if (type === "lost" && draft.privateDetail?.trim()) {
    parts.push(`Éléments distinctifs : ${draft.privateDetail.trim()}`);
  }
  return parts.length > 0 ? parts.join("\n\n") : null;
}

/**
 * Persists a report-lost / report-found draft (see src/lib/declarationDraft.ts)
 * as a real `items` row. For found items, a private verification detail is
 * also stored in `item_secrets` (checked later against a claimant's answer);
 * lost items have no such check, so their equivalent field is folded into
 * the public description instead of creating an orphaned secret row.
 */
export async function createItemFromDraft(draft: DeclarationDraft, type: ItemType) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user ?? null;
  if (!user) {
    return { data: null, error: new Error("Vous devez être connecté pour publier une déclaration.") };
  }

  // Same pre-check pattern as the daily cap below: the items INSERT policy
  // (see 20260921030000_require_identity_verification_to_declare.sql) also
  // requires an approved identity_verified_at, but that RLS violation alone
  // can't tell the caller which requirement failed.
  const { data: profile } = await supabase
    .from("profiles")
    .select("identity_verified_at")
    .eq("id", user.id)
    .maybeSingle<{ identity_verified_at: string | null }>();
  if (!profile?.identity_verified_at) {
    return { data: null, error: new Error("Votre compte est en cours de vérification. Veuillez patienter avant de publier une déclaration.") };
  }

  // Pre-check rather than parsing the RLS-violation error the insert would
  // otherwise raise (see user_items_created_in_last_24h/the items INSERT
  // policy in supabase/migrations/20260918120000_cap_daily_declarations.sql)
  // — that error has no way to distinguish "rate limited" from any other
  // policy failure, so it couldn't carry a message this specific.
  const { data: recentCount } = await supabase.rpc("user_items_created_in_last_24h", { p_user_id: user.id });
  if ((recentCount ?? 0) >= 2) {
    return { data: null, error: new Error("Vous avez atteint la limite de 2 déclarations par 24 heures. Réessayez plus tard.") };
  }

  const { data: item, error } = await supabase
    .from("items")
    .insert({
      user_id: user.id,
      type,
      category_id: draft.categoryId ?? "other",
      category_label: draft.categoryLabel ?? "Autre objet",
      category_icon: draft.categoryIcon ?? null,
      title: draft.objectName?.trim() || draft.categoryLabel || "Objet",
      description: buildDescription(draft, type),
      brand: draft.brand || null,
      colors: draft.colors && draft.colors.length > 0 ? draft.colors : null,
      location_public: draft.locationPublic || null,
      hide_exact_location: draft.hideExactLocation ?? false,
      occurred_on: draft.date || null,
      photos: draft.photos ?? [],
    })
    .select()
    .single<Item>();

  if (error || !item) {
    return { data: null, error: new Error("Une erreur est survenue, réessayez.") };
  }

  await Promise.all([
    type === "found" && draft.privateDetail && draft.privateDetail.trim().length > 0
      ? supabase.from("item_secrets").insert({ item_id: item.id, private_detail: draft.privateDetail.trim() })
      : null,
    // Exact location lives in its own RLS-protected table, not on items
    // itself — see 20260923010000_protect_item_location.sql.
    draft.location ? supabase.from("item_locations").insert({ item_id: item.id, location: draft.location }) : null,
    type === "found" ? awardFoundItemTrustBonus(item.id) : null,
  ]);

  return { data: item, error: null };
}

export async function listFoundItems(limit = 10) {
  const supabase = createClient();
  return supabase
    .from("items_public")
    .select("*")
    .eq("type", "found")
    .in("status", ["searching", "matched"])
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(limit)
    .returns<Item[]>();
}

export async function listMyItems() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user ?? null;
  if (!user) return { data: [] as Item[], error: null };

  // items_public rather than items directly: the exact location now lives in
  // its own RLS-protected table (see 20260923010000_protect_item_location.sql)
  // that items_public already joins correctly — including always showing the
  // real value back to the owner, which is what this listing needs.
  return supabase
    .from("items_public")
    .select("*")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .returns<Item[]>();
}

/**
 * Soft-deletes a declaration: the row is kept (matches/messages still
 * reference it, and it stays available for an admin review page later) but
 * excluded from the owner's list, matching candidates, and the home feed.
 */
export async function softDeleteItem(itemId: string, resolvedBeforeDeletion: boolean, reason?: string) {
  const supabase = createClient();
  return supabase
    .from("items")
    .update({
      deleted_at: new Date().toISOString(),
      resolved_before_deletion: resolvedBeforeDeletion,
      deletion_reason: reason?.trim() || null,
    })
    .eq("id", itemId);
}

/** Only returns a row when the caller owns the item — enforced by RLS. */
export async function getItemSecret(itemId: string) {
  const supabase = createClient();
  return supabase
    .from("item_secrets")
    .select("private_detail")
    .eq("item_id", itemId)
    .maybeSingle<{ private_detail: string }>();
}

/**
 * Reads through items_public, which serves the coarse location instead of
 * the exact one for a hide_exact_location item, unless the caller is its
 * owner or the confirmed counterpart of a match on it. Callers that already
 * know they're the owner (e.g. "Mes objets") should read from items
 * directly instead.
 */
export async function getItem(id: string) {
  const supabase = createClient();
  return supabase.from("items_public").select("*").eq("id", id).single<Item>();
}

/** Uploads a photo to the "item-photos" bucket under the user's own folder and returns its public URL. */
export async function uploadItemPhoto(file: File) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user ?? null;
  if (!user) return { url: null, error: new Error("Vous devez être connecté.") };

  const ext = file.name.split(".").pop() || "jpg";
  const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error: uploadError } = await supabase.storage.from("item-photos").upload(path, file, {
    contentType: file.type || "image/jpeg",
  });
  if (uploadError) return { url: null, error: uploadError };

  const { data } = supabase.storage.from("item-photos").getPublicUrl(path);
  return { url: data.publicUrl, error: null };
}

export type MyItemStats = { signaled: number; found: number; recovered: number };

export async function getMyItemStats(userId: string): Promise<MyItemStats> {
  const supabase = createClient();
  const [signaled, found, recovered] = await Promise.all([
    supabase.from("items").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("type", "lost").is("deleted_at", null),
    supabase.from("items").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("type", "found").is("deleted_at", null),
    supabase
      .from("items")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .in("status", ["recovered", "returned"])
      .is("deleted_at", null),
  ]);

  return {
    signaled: signaled.count ?? 0,
    found: found.count ?? 0,
    recovered: recovered.count ?? 0,
  };
}
