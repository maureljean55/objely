import { createClient } from "@/lib/supabase/client";

export type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  avatar_url: string | null;
  trust_score: number;
};

export async function getMyProfile() {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return { data: null, error: null };

  return supabase.from("profiles").select("*").eq("id", user.id).maybeSingle<Profile>();
}

export async function updateAvatarUrl(avatarUrl: string) {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return { error: new Error("Vous devez être connecté.") };

  return supabase.from("profiles").update({ avatar_url: avatarUrl }).eq("id", user.id);
}

/** Bumps the caller's trust score for declaring a found item — server-side verifies they own it and it's a "found" item, and won't award it twice. */
export async function awardFoundItemTrustBonus(itemId: string) {
  const supabase = createClient();
  return supabase.rpc("award_found_item_trust_bonus", { p_item_id: itemId });
}

/** Bumps the caller's trust score for seeing a restitution through — server-side verifies they're the found-item owner on a confirmed match, and won't award it twice. */
export async function awardRestitutionTrustBonus(matchId: string) {
  const supabase = createClient();
  return supabase.rpc("award_restitution_trust_bonus", { p_match_id: matchId });
}

/** Uploads a photo to the "avatars" bucket under the user's own folder and returns its public URL. */
export async function uploadAvatarPhoto(file: File) {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return { url: null, error: new Error("Vous devez être connecté.") };

  const ext = file.name.split(".").pop() || "jpg";
  const path = `${user.id}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, {
    upsert: true,
    contentType: file.type || "image/jpeg",
  });
  if (uploadError) return { url: null, error: uploadError };

  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  return { url: data.publicUrl, error: null };
}
