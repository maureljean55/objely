import { NextResponse } from "next/server";
import { createClient as createAdminClient, type SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

// Every bucket the app uploads to (see uploadItemPhoto/uploadAvatarPhoto/
// uploadVoiceNote) stores files under `${userId}/...`, so emptying a user's
// data here is just listing and removing everything in that one folder per
// bucket — no per-file tracking needed.
const STORAGE_BUCKETS = ["item-photos", "avatars", "voice-messages"];

async function emptyUserStorage(admin: SupabaseClient, userId: string) {
  for (const bucket of STORAGE_BUCKETS) {
    const { data: files, error: listError } = await admin.storage.from(bucket).list(userId, { limit: 1000 });
    if (listError) {
      console.error(`Failed to list ${bucket}/${userId} before account deletion`, listError);
      continue;
    }
    if (!files || files.length === 0) continue;

    const paths = files.map((file) => `${userId}/${file.name}`);
    const { error: removeError } = await admin.storage.from(bucket).remove(paths);
    if (removeError) {
      console.error(`Failed to remove ${paths.length} file(s) from ${bucket} for user ${userId}`, removeError);
    }
  }
}

// Deleting the auth.users row cascades every table that references it
// (profiles, items, matches, messages, notifications, direct_conversations,
// restitution_appointments, ...) since they were all created with
// `on delete cascade` — Postgres cleans those up on its own. Storage isn't
// tied to that cascade, so emptyUserStorage handles it explicitly, first,
// so a failure there doesn't leave orphaned files unaccounted for.
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

  await emptyUserStorage(admin, user.id);

  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
  if (deleteError) {
    console.error("Failed to delete user", user.id, deleteError);
    return NextResponse.json({ error: "La suppression a échoué. Réessayez plus tard." }, { status: 500 });
  }

  await supabase.auth.signOut();
  return NextResponse.json({ success: true });
}
