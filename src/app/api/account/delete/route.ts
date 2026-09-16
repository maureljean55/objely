import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

// Deleting the auth.users row is the only step needed on our side: every
// table that references it (profiles, items, matches, messages,
// notifications, direct_conversations, restitution_appointments, ...) was
// created with `on delete cascade`, so Postgres cleans up the rest. Storage
// objects (photos, avatars) are NOT covered by that and are left behind —
// a known gap, not something this route attempts to fix.
export async function POST(request: Request) {
  const { password } = await request.json().catch(() => ({ password: null }));
  if (!password || typeof password !== "string") {
    return NextResponse.json({ error: "Mot de passe requis." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) {
    return NextResponse.json({ error: "Session invalide. Reconnectez-vous et réessayez." }, { status: 401 });
  }

  // Re-verify the password right before an irreversible action — the
  // session alone isn't enough proof of intent for something this
  // consequential (same reasoning as changePassword).
  const { error: reauthError } = await supabase.auth.signInWithPassword({ email: user.email, password });
  if (reauthError) {
    return NextResponse.json({ error: "Mot de passe incorrect." }, { status: 401 });
  }

  const secretKey = process.env.SUPABASE_SECRET_KEY;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!secretKey || !url) {
    console.error("SUPABASE_SECRET_KEY or NEXT_PUBLIC_SUPABASE_URL is not set; cannot delete account.");
    return NextResponse.json({ error: "Suppression indisponible pour le moment. Réessayez plus tard." }, { status: 503 });
  }

  const admin = createAdminClient(url, secretKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
  if (deleteError) {
    console.error("Failed to delete user", user.id, deleteError);
    return NextResponse.json({ error: "La suppression a échoué. Réessayez plus tard." }, { status: 500 });
  }

  await supabase.auth.signOut();
  return NextResponse.json({ success: true });
}
