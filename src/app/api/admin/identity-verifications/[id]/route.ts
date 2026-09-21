import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/auth";
import { createAdminSupabaseClient } from "@/lib/admin/supabaseAdmin";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const { id } = await params;
  const { action, reason } = await request.json().catch(() => ({ action: null, reason: null }));
  if (action !== "approve" && action !== "reject") {
    return NextResponse.json({ error: "Action invalide." }, { status: 400 });
  }

  const admin = createAdminSupabaseClient();
  if (!admin) return NextResponse.json({ error: "Indisponible pour le moment." }, { status: 503 });

  const { error } =
    action === "approve"
      ? await admin.rpc("approve_identity_verification", { p_verification_id: id, p_reviewer: session.fullName })
      : await admin.rpc("reject_identity_verification", {
          p_verification_id: id,
          p_reviewer: session.fullName,
          p_reason: (reason as string | null)?.trim() || null,
        });

  if (error) return NextResponse.json({ error: "La mise à jour a échoué." }, { status: 500 });
  return NextResponse.json({ success: true });
}
