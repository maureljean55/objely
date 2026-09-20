import { createClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/compressImage";

const MAX_ATTACHMENT_BYTES = 15 * 1024 * 1024;
const MAX_IMAGE_DIMENSION = 1600;
const IMAGE_QUALITY = 0.82;

/** Uploads a photo (from the camera or the gallery) to the "message-attachments" bucket, compressing it first. */
export async function uploadMessageImage(file: File) {
  const compressed = file.type.startsWith("image/") ? await compressImage(file, MAX_IMAGE_DIMENSION, IMAGE_QUALITY) : file;
  return uploadMessageAttachment(compressed);
}

/** Uploads a PDF (or any other file) to the "message-attachments" bucket, unmodified. */
export async function uploadMessageFile(file: File) {
  return uploadMessageAttachment(file);
}

async function uploadMessageAttachment(file: File) {
  if (file.size > MAX_ATTACHMENT_BYTES) {
    return { url: null, name: null, type: null, error: new Error("Le fichier dépasse la taille maximale autorisée (15 Mo).") };
  }

  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user ?? null;
  if (!user) return { url: null, name: null, type: null, error: new Error("Vous devez être connecté.") };

  const ext = file.name.split(".").pop() || "bin";
  const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error: uploadError } = await supabase.storage.from("message-attachments").upload(path, file, {
    contentType: file.type || "application/octet-stream",
  });
  if (uploadError) return { url: null, name: null, type: null, error: uploadError };

  const { data } = supabase.storage.from("message-attachments").getPublicUrl(path);
  return { url: data.publicUrl, name: file.name, type: file.type || "application/octet-stream", error: null };
}
