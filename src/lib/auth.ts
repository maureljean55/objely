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

function lockoutMessage(retryAfterSeconds: number): string {
  const minutes = Math.ceil(retryAfterSeconds / 60);
  const delay = minutes <= 1 ? "moins d'une minute" : `${minutes} minutes`;
  return `Trop de tentatives de connexion. Réessayez dans ${delay}.`;
}

// Lockout state lives in Postgres (login_attempts table, via the
// check_login_lockout/register_login_attempt RPCs — see the migration for
// why), not in anything the client controls, so clearing localStorage or
// retrying in a private window doesn't reset it. This slows down repeated
// wrong passwords against one account through this app's own UI; it isn't a
// substitute for Supabase's platform-level auth rate limits (Dashboard >
// Auth > Rate Limits), which stay the real backstop since a caller that
// skips this app entirely and hits Supabase directly with the anon key
// never goes through this check at all.
export async function signInWithPassword(email: string, password: string, remember: boolean) {
  const supabase = createClient();
  const identifier = email.trim().toLowerCase();

  const { data: lockoutCheck } = await supabase.rpc("check_login_lockout", { p_identifier: identifier });
  if (lockoutCheck?.[0]?.locked) {
    return { error: { message: lockoutMessage(lockoutCheck[0].retry_after_seconds) } };
  }

  const result = await supabase.auth.signInWithPassword({ email, password });
  const { data: attemptResult } = await supabase.rpc("register_login_attempt", {
    p_identifier: identifier,
    p_success: !result.error,
  });

  if (result.error) {
    if (attemptResult?.[0]?.locked) {
      return { error: { message: lockoutMessage(attemptResult[0].retry_after_seconds) } };
    }
    return result;
  }

  try {
    localStorage.setItem(REMEMBER_KEY, remember ? "true" : "false");
    sessionStorage.setItem(SESSION_ACTIVE_KEY, "true");
  } catch {}

  if (!remember) forgetAuthCookiesOnClose();

  return result;
}

/** Checks whether the just-established session still needs a TOTP code before it's fully authenticated. */
export async function getMfaChallengeStatus(): Promise<{ required: boolean; factorId: string | null }> {
  const supabase = createClient();
  const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (!data || data.currentLevel === data.nextLevel) return { required: false, factorId: null };

  const { data: factors } = await supabase.auth.mfa.listFactors();
  const factorId = factors?.totp?.find((f) => f.status === "verified")?.id ?? null;
  return { required: !!factorId, factorId };
}

export async function verifyMfaChallenge(factorId: string, code: string, remember: boolean) {
  const supabase = createClient();
  const result = await supabase.auth.mfa.challengeAndVerify({ factorId, code });
  // challengeAndVerify writes a fresh session, which goes through the same
  // forced-400-day-Max-Age storage adapter as the password step — redo the
  // session-cookie rewrite so "remember me" unchecked still holds after MFA.
  if (!result.error && !remember) forgetAuthCookiesOnClose();
  return result;
}

/**
 * Redirects to Google's consent screen; Supabase creates the account on
 * first sign-in automatically, so this covers both login and signup. The
 * browser navigates away immediately, so there's no local session to apply
 * "remember me" to here — /auth/callback (exchangeCodeForSession) is what
 * actually establishes it once Google redirects back.
 */
export async function signInWithGoogle(next?: string) {
  const supabase = createClient();
  const redirectTo = new URL("/auth/callback", window.location.origin);
  if (next && next.startsWith("/") && !next.startsWith("//")) {
    redirectTo.searchParams.set("next", next);
  }
  return supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: redirectTo.toString() },
  });
}

/** Re-verifies the current password (Supabase's updateUser doesn't require it) before setting a new one. */
export async function changePassword(currentPassword: string, newPassword: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return { error: { message: "Session invalide. Reconnectez-vous et réessayez." } };

  const { error: reauthError } = await supabase.auth.signInWithPassword({ email: user.email, password: currentPassword });
  if (reauthError) return { error: { message: "Mot de passe actuel incorrect." } };

  const result = await supabase.auth.updateUser({ password: newPassword });

  // Both signInWithPassword and updateUser just wrote a fresh session cookie
  // through the same forced-400-day-Max-Age storage adapter as the original
  // login — redo the rewrite if this account opted out of persistence, or
  // changing your password would silently re-persist a "remember me"
  // unchecked session.
  try {
    if (!result.error && localStorage.getItem(REMEMBER_KEY) === "false") forgetAuthCookiesOnClose();
  } catch {}

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
