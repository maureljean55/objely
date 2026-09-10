import { createClient } from "@/lib/supabase/client";

/** Uploads a recorded voice note to the "voice-messages" bucket under the user's own folder and returns its public URL. */
export async function uploadVoiceNote(blob: Blob) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user ?? null;
  if (!user) return { url: null, error: new Error("Vous devez être connecté.") };

  // MediaRecorder's actual output format varies by browser (Chrome/Android
  // records webm/opus, Safari/iOS records mp4/aac) — the file extension was
  // previously hardcoded to .webm regardless, which is simply wrong for
  // every non-Chromium recording.
  const mimeType = blob.type || "audio/webm";
  const ext = mimeType.includes("mp4") ? "m4a" : mimeType.includes("ogg") ? "ogg" : "webm";
  const path = `${user.id}/${Date.now()}.${ext}`;
  const { error: uploadError } = await supabase.storage.from("voice-messages").upload(path, blob, {
    contentType: mimeType,
  });
  if (uploadError) return { url: null, error: uploadError };

  const { data } = supabase.storage.from("voice-messages").getPublicUrl(path);
  return { url: data.publicUrl, error: null };
}
