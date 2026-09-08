import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// How long before actual expiry we proactively refresh. Must be comfortably
// bigger than one request's worth of clock drift/latency.
const REFRESH_BUFFER_SECONDS = 60;

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    // Missing config would otherwise throw here on every request and take
    // the whole app down with it — let the request through unauthenticated
    // instead of a blank Internal Server Error page.
    console.error("Supabase env vars are not set; skipping session refresh.");
    return supabaseResponse;
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options));
      },
    },
  });

  // getSession() is a local read (no network) — it tells us whether there's
  // a session at all, and how long it has left, without paying for a round
  // trip to Supabase's Auth server on every single request.
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const needsRefresh =
    session !== null &&
    (session.expires_at === undefined || session.expires_at - Math.floor(Date.now() / 1000) < REFRESH_BUFFER_SECONDS);

  // Only pay the real network round trip when there's actually a session to
  // keep alive and it's genuinely close to expiring — RLS re-verifies the
  // JWT's signature on every DB call regardless, so skipping this doesn't
  // open a data-access gap. The trade-off is that a token revoked server-side
  // (banned account, password change elsewhere) stops working at its natural
  // expiry instead of on the very next request.
  if (needsRefresh) {
    await supabase.auth.getUser();
  }

  return supabaseResponse;
}
