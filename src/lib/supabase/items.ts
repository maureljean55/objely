import { createClient } from "@/lib/supabase/client";
import type { DeclarationDraft } from "@/lib/declarationDraft";
import { incrementTrustScore } from "@/lib/supabase/profile";

// Trust score grows with real, verifiable actions: a small bump for
// reporting a found item, a bigger one once a restitution is actually
// confirmed (see resolveMatch in verification.ts).
const FOUND_ITEM_TRUST_BONUS = 5;

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
 * Persists a report-lost / report-found draft (see src/lib/declarationDraft.ts)
 * as a real `items` row, plus its private verification detail in
 * `item_secrets` when one was provided.
 */
export async function createItemFromDraft(draft: DeclarationDraft, type: ItemType) {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) {
    return { data: null, error: new Error("Vous devez être connecté pour publier une déclaration.") };
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
      description: draft.description || null,
      brand: draft.brand || null,
      colors: draft.colors && draft.colors.length > 0 ? draft.colors : null,
      location: draft.location || null,
      hide_exact_location: draft.hideExactLocation ?? false,
      occurred_on: draft.date || null,
      photos: draft.photos ?? [],
    })
    .select()
    .single<Item>();

  if (error || !item) {
    return { data: null, error };
  }

  if (draft.privateDetail && draft.privateDetail.trim().length > 0) {
    await supabase.from("item_secrets").insert({ item_id: item.id, private_detail: draft.privateDetail.trim() });
  }

  if (type === "found") {
    await incrementTrustScore(FOUND_ITEM_TRUST_BONUS);
  }

  return { data: item, error: null };
}

export async function listFoundItems(limit = 10) {
  const supabase = createClient();
  return supabase
    .from("items")
    .select("*")
    .eq("type", "found")
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(limit)
    .returns<Item[]>();
}

export async function listMyItems() {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return { data: [] as Item[], error: null };

  return supabase
    .from("items")
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

export async function getItem(id: string) {
  const supabase = createClient();
  return supabase.from("items").select("*").eq("id", id).single<Item>();
}

/** Uploads a photo to the "item-photos" bucket under the user's own folder and returns its public URL. */
export async function uploadItemPhoto(file: File) {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
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
