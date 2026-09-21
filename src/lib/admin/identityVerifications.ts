import { createAdminSupabaseClient } from "@/lib/admin/supabaseAdmin";
import type { IdentityVerificationStatus } from "@/lib/supabase/identityVerification";

const SIGNED_URL_TTL_SECONDS = 300;

export type AdminIdentityVerification = {
  id: string;
  status: IdentityVerificationStatus;
  rejection_reason: string | null;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  documentUrl: string | null;
  user: { full_name: string | null; public_id: string } | null;
};

export async function listIdentityVerifications(): Promise<AdminIdentityVerification[]> {
  const admin = createAdminSupabaseClient();
  if (!admin) return [];

  const { data: verifications, error } = await admin
    .from("identity_verifications")
    .select("id, user_id, document_path, status, rejection_reason, created_at, reviewed_at, reviewed_by")
    .order("created_at", { ascending: false });

  if (error || !verifications) {
    console.error("Failed to load identity_verifications", error);
    return [];
  }

  const userIds = [...new Set(verifications.map((v) => v.user_id))];
  const { data: profiles } = userIds.length
    ? await admin.from("profiles").select("id, full_name, public_id").in("id", userIds)
    : { data: [] as { id: string; full_name: string | null; public_id: string }[] };

  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));

  return Promise.all(
    verifications.map(async (v) => {
      const { data: signed } = await admin.storage
        .from("identity-documents")
        .createSignedUrl(v.document_path, SIGNED_URL_TTL_SECONDS);
      const user = profileById.get(v.user_id) ?? null;
      return {
        id: v.id,
        status: v.status,
        rejection_reason: v.rejection_reason,
        created_at: v.created_at,
        reviewed_at: v.reviewed_at,
        reviewed_by: v.reviewed_by,
        documentUrl: signed?.signedUrl ?? null,
        user: user ? { full_name: user.full_name, public_id: user.public_id } : null,
      };
    }),
  );
}
