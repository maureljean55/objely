import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

// Supabase's session cookie always persists for ~400 days regardless of any
// per-call option, so "remember me" is implemented on top of it: when the
// user opts out, we drop a marker and force a sign-out the next time the app
// boots in a new browser session (sessionStorage is cleared when the browser/
// tab closes, so its absence means "this is a fresh session").
const REMEMBER_KEY = "objely-remember";
const SESSION_ACTIVE_KEY = "objely-session-active";

export async function signInWithPassword(email: string, password: string, remember: boolean) {
  const supabase = createClient();
  const result = await supabase.auth.signInWithPassword({ email, password });

  if (!result.error) {
    try {
      localStorage.setItem(REMEMBER_KEY, remember ? "true" : "false");
      sessionStorage.setItem(SESSION_ACTIVE_KEY, "true");
    } catch {}
  }

  return result;
}

export async function signUpWithPassword(email: string, password: string, metadata: Record<string, unknown>) {
  const supabase = createClient();
  return supabase.auth.signUp({
    email,
    password,
    options: { data: metadata, emailRedirectTo: `${window.location.origin}/auth/callback` },
  });
}

export async function signOut() {
  const supabase = createClient();
  try {
    localStorage.removeItem(REMEMBER_KEY);
    sessionStorage.removeItem(SESSION_ACTIVE_KEY);
  } catch {}
  return supabase.auth.signOut();
}

export async function getCurrentUser(): Promise<User | null> {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
}

/**
 * Signs the user out if they previously logged in with "remember me"
 * unchecked and the browser session has since restarted. Call once on app
 * boot (see SessionGuard).
 */
export async function enforceRememberMe() {
  try {
    const remembered = localStorage.getItem(REMEMBER_KEY);
    const sessionActive = sessionStorage.getItem(SESSION_ACTIVE_KEY);

    if (remembered === "false" && !sessionActive) {
      await signOut();
      return;
    }

    if (remembered !== null) {
      sessionStorage.setItem(SESSION_ACTIVE_KEY, "true");
    }
  } catch {}
}
