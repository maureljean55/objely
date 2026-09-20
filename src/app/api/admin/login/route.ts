import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminSupabaseClient } from "@/lib/admin/supabaseAdmin";
import { verifyPassword } from "@/lib/admin/passwordHash";
import { ADMIN_SESSION_COOKIE, createAdminSessionToken } from "@/lib/admin/session";

// A syntactically valid scrypt hash with no matching real password — used to
// keep the "unknown email" path's timing indistinguishable from "wrong
// password" (see the comment at the verifyPassword call below).
const DUMMY_HASH = `${"0".repeat(32)}:${"0".repeat(128)}`;

export async function POST(request: Request) {
  const { email, password } = await request.json().catch(() => ({ email: null, password: null }));
  if (!email || !password || typeof email !== "string" || typeof password !== "string") {
    return NextResponse.json({ error: "Email et mot de passe requis." }, { status: 400 });
  }

  const admin = createAdminSupabaseClient();
  if (!admin) {
    return NextResponse.json({ error: "Connexion admin indisponible pour le moment." }, { status: 503 });
  }

  const { data: adminUser, error } = await admin
    .from("admin_users")
    .select("id, email, password_hash, full_name, role")
    .eq("email", email.trim().toLowerCase())
    .maybeSingle();

  // Always run the scrypt comparison, even for an email that doesn't exist —
  // otherwise a missing row short-circuits before the (deliberately slow)
  // hash check runs, and the response-time gap tells an attacker which
  // admin emails are registered.
  const passwordOk = verifyPassword(password, adminUser?.password_hash ?? DUMMY_HASH);
  if (error || !adminUser || !passwordOk) {
    return NextResponse.json({ error: "Identifiants incorrects." }, { status: 401 });
  }

  const token = createAdminSessionToken({
    id: adminUser.id,
    email: adminUser.email,
    fullName: adminUser.full_name,
    role: adminUser.role,
  });
  if (!token) {
    return NextResponse.json({ error: "Connexion admin indisponible pour le moment." }, { status: 503 });
  }

  await admin.from("admin_users").update({ last_login_at: new Date().toISOString() }).eq("id", adminUser.id);

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  return NextResponse.json({ success: true });
}
