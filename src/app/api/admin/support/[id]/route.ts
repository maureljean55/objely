import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/auth";
import { createAdminSupabaseClient } from "@/lib/admin/supabaseAdmin";

/** An admin replies to an escalated support conversation. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const { id } = await params;
  const { body } = await request.json().catch(() => ({ body: null }));
  if (typeof body !== "string" || body.trim().length === 0) {
    return NextResponse.json({ error: "Message vide." }, { status: 400 });
  }

  const admin = createAdminSupabaseClient();
  if (!admin) return NextResponse.json({ error: "Indisponible pour le moment." }, { status: 503 });

  const { data: conversation } = await admin.from("support_conversations").select("id").eq("id", id).maybeSingle();
  if (!conversation) return NextResponse.json({ error: "Conversation introuvable." }, { status: 404 });

  const { data: message, error } = await admin
    .from("support_messages")
    .insert({ conversation_id: id, sender: "admin", sender_name: session.fullName, body: body.trim() })
    .select()
    .single();
  if (error) return NextResponse.json({ error: "L'envoi a échoué." }, { status: 500 });

  // A human reply means the bot should stop auto-answering this
  // conversation (see /api/support-chat, which only replies while
  // status='bot') — flip to escalated regardless of the prior status,
  // including re-opening one an admin had closed.
  await admin.from("support_conversations").update({ status: "escalated", updated_at: new Date().toISOString() }).eq("id", id);

  return NextResponse.json({ message });
}

/** Closes or reopens a conversation — mirrors the resolve/reopen toggle on signalements. */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const { id } = await params;
  const { action } = await request.json().catch(() => ({ action: null }));
  if (action !== "close" && action !== "reopen") {
    return NextResponse.json({ error: "Action invalide." }, { status: 400 });
  }

  const admin = createAdminSupabaseClient();
  if (!admin) return NextResponse.json({ error: "Indisponible pour le moment." }, { status: 503 });

  const { error } = await admin
    .from("support_conversations")
    .update({ status: action === "close" ? "closed" : "escalated" })
    .eq("id", id);

  if (error) return NextResponse.json({ error: "La mise à jour a échoué." }, { status: 500 });
  return NextResponse.json({ success: true });
}
