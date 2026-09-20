// One-off CLI to create/update an objely-admin login (admin_users table).
// The admin portal has no self-service signup on purpose — accounts are
// provisioned by whoever already has service-role access.
//
// Usage:
//   node --env-file=.env.local scripts/create-admin.mjs <email> <password> "<Full Name>" [role]
//
// role defaults to "admin"; pass "super_admin" for elevated accounts.

import { randomBytes, scryptSync } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const [email, password, fullName, role = "admin"] = process.argv.slice(2);

if (!email || !password || !fullName) {
  console.error('Usage: node --env-file=.env.local scripts/create-admin.mjs <email> <password> "<Full Name>" [role]');
  process.exit(1);
}

if (role !== "admin" && role !== "super_admin") {
  console.error('role must be "admin" or "super_admin"');
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;
if (!url || !secretKey) {
  console.error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY must be set (pass --env-file=.env.local).");
  process.exit(1);
}

// Mirrors src/lib/admin/passwordHash.ts's format exactly — keep both in sync.
function hashPassword(plain) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(plain, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

const supabase = createClient(url, secretKey, { auth: { autoRefreshToken: false, persistSession: false } });

const { error } = await supabase
  .from("admin_users")
  .upsert(
    { email: email.trim().toLowerCase(), password_hash: hashPassword(password), full_name: fullName, role },
    { onConflict: "email" },
  );

if (error) {
  console.error("Failed to create admin user:", error.message);
  process.exit(1);
}

console.log(`Admin account ready: ${email} (${role})`);
