import { createClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/compressImage";

const DOCUMENT_MAX_DIMENSION = 1800;
const DOCUMENT_JPEG_QUALITY = 0.9;

export type IdentityVerificationStatus = "pending" | "approved" | "rejected";

export type IdentityVerification = {
  id: string;
  status: IdentityVerificationStatus;
  rejection_reason: string | null;
  created_at: string;
  reviewed_at: string | null;
};

/** The current user's most recent identity verification submission, if any. */
export async function getMyIdentityVerification() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user ?? null;
  if (!user) return { data: null, error: null };

  return supabase
    .from("identity_verifications")
    .select("id, status, rejection_reason, created_at, reviewed_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<IdentityVerification>();
}

/** Uploads an ID document photo to the private "identity-documents" bucket and files it for review. */
export async function submitIdentityVerification(file: File) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user ?? null;
  if (!user) return { error: new Error("Vous devez être connecté.") };

  const compressed = await compressImage(file, DOCUMENT_MAX_DIMENSION, DOCUMENT_JPEG_QUALITY);
  const ext = compressed.name.split(".").pop() || "jpg";
  const path = `${user.id}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage.from("identity-documents").upload(path, compressed, {
    contentType: compressed.type || "image/jpeg",
  });
  if (uploadError) return { error: uploadError };

  const { error: insertError } = await supabase
    .from("identity_verifications")
    .insert({ user_id: user.id, document_path: path });

  return { error: insertError };
}
