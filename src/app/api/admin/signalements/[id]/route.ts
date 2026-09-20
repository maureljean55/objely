import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/auth";
import { createAdminSupabaseClient } from "@/lib/admin/supabaseAdmin";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const { id } = await params;
  const { action } = await request.json().catch(() => ({ action: null }));
  if (action !== "resolve" && action !== "reopen") {
    return NextResponse.json({ error: "Action invalide." }, { status: 400 });
  }

  const admin = createAdminSupabaseClient();
  if (!admin) return NextResponse.json({ error: "Indisponible pour le moment." }, { status: 503 });

  const { error } = await admin
    .from("problem_reports")
    .update(
      action === "resolve"
        ? { resolved_at: new Date().toISOString(), resolved_by: session.fullName }
        : { resolved_at: null, resolved_by: null },
    )
    .eq("id", id);

  if (error) return NextResponse.json({ error: "La mise à jour a échoué." }, { status: 500 });
  return NextResponse.json({ success: true });
}
