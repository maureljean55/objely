import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Service-role client for the admin portal's server-side routes: it bypasses
// RLS entirely (same pattern as src/app/api/account/delete), which is
// required here since problem_reports' RLS only lets a reporter see their
// own rows and admins need to see everyone's.
export function createAdminSupabaseClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secretKey) {
    console.error("SUPABASE_SECRET_KEY or NEXT_PUBLIC_SUPABASE_URL is not set; admin data access is disabled.");
    return null;
  }
  return createClient(url, secretKey, { auth: { autoRefreshToken: false, persistSession: false } });
}
