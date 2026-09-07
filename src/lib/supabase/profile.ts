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

/** Bumps the current user's own trust score by `delta` (server-side clamped to 100). */
export async function incrementTrustScore(delta: number) {
  const supabase = createClient();
  return supabase.rpc("increment_trust_score", { delta });
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
