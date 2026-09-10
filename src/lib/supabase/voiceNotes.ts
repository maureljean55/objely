import { createClient } from "@/lib/supabase/client";

/** Uploads a recorded voice note to the "voice-messages" bucket under the user's own folder and returns its public URL. */
export async function uploadVoiceNote(blob: Blob) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user ?? null;
  if (!user) return { url: null, error: new Error("Vous devez être connecté.") };

  const path = `${user.id}/${Date.now()}.webm`;
  const { error: uploadError } = await supabase.storage.from("voice-messages").upload(path, blob, {
    contentType: blob.type || "audio/webm",
  });
  if (uploadError) return { url: null, error: uploadError };

  const { data } = supabase.storage.from("voice-messages").getPublicUrl(path);
  return { url: data.publicUrl, error: null };
}
