import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

// @supabase/ssr's browser storage adapter unconditionally forces every
// cookie it writes to a ~400-day Max-Age, ignoring any cookieOptions
// override passed at client creation (see the `setItem` in
// @supabase/ssr/dist/module/cookies.js — it recomputes
// `maxAge: DEFAULT_COOKIE_OPTIONS.maxAge` after spreading in whatever you
// passed). So "remember me" can't be implemented by asking the library for
// a session-only cookie; the only way is to rewrite the cookie ourselves
// right after sign-in, dropping Max-Age/Expires so the browser treats it as
// a real session cookie and discards it on full close. That's a stronger
// guarantee than the sessionStorage marker below: the server never sees a
// session at all on the next launch, instead of rendering the signed-in
// view first and correcting it client-side after hydration (which is what
// the marker alone did, and which briefly exposed the previous user's data
// on a shared device).
const REMEMBER_KEY = "objely-remember";
const SESSION_ACTIVE_KEY = "objely-session-active";

function forgetAuthCookiesOnClose() {
  if (typeof document === "undefined") return;
  const cookieNames = document.cookie
    .split("; ")
    .map((pair) => pair.slice(0, pair.indexOf("=")))
    .filter((name) => /^sb-.*-auth-token/.test(name));

  for (const name of cookieNames) {
    const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
    if (!match) continue;
    // Same path Supabase itself uses (see DEFAULT_COOKIE_OPTIONS) — has to
    // match exactly for this to overwrite the same cookie instead of
    // creating a second one.
    document.cookie = `${name}=${match[1]}; path=/; SameSite=Lax`;
  }
}

export async function signInWithPassword(email: string, password: string, remember: boolean) {
  const supabase = createClient();
  const result = await supabase.auth.signInWithPassword({ email, password });

  if (!result.error) {
    try {
      localStorage.setItem(REMEMBER_KEY, remember ? "true" : "false");
      sessionStorage.setItem(SESSION_ACTIVE_KEY, "true");
    } catch {}

    if (!remember) forgetAuthCookiesOnClose();
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
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.user ?? null;
}

/**
 * Defense-in-depth backstop for forgetAuthCookiesOnClose above: signs the
 * user out if they previously logged in with "remember me" unchecked and
 * the browser session has since restarted. Call once on app boot (see
 * SessionGuard). The cookie itself should already be gone by then in any
 * browser that honors session-cookie expiry, so this mainly covers a
 * session established before this fix shipped, or an environment that
 * doesn't clear session cookies on close.
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
