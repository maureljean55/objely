import { createClient } from "@/lib/supabase/client";

const MAX_ATTACHMENT_BYTES = 15 * 1024 * 1024;

/** Uploads a file (photo, PDF, or anything else) to the "support-attachments" bucket under the user's own folder. */
export async function uploadSupportAttachment(file: File) {
  if (file.size > MAX_ATTACHMENT_BYTES) {
    return { url: null, name: null, type: null, error: new Error("Le fichier dépasse la taille maximale autorisée (15 Mo).") };
  }

  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user ?? null;
  if (!user) return { url: null, name: null, type: null, error: new Error("Vous devez être connecté.") };

  const ext = file.name.split(".").pop() || "bin";
  const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error: uploadError } = await supabase.storage.from("support-attachments").upload(path, file, {
    contentType: file.type || "application/octet-stream",
  });
  if (uploadError) return { url: null, name: null, type: null, error: uploadError };

  const { data } = supabase.storage.from("support-attachments").getPublicUrl(path);
  return { url: data.publicUrl, name: file.name, type: file.type || "application/octet-stream", error: null };
}
