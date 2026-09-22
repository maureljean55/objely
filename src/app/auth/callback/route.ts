import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Supabase's email links (signup confirmation, password reset, magic link)
// all redirect here with either a `code` to exchange for a session or an
// `error_description` if the link was invalid/expired/already used.
// `next` must be a same-origin relative path — building the redirect below
// as a plain string (`${origin}${next}`) rather than `new URL(next, origin)`
// means a value like "@evil.example/x" is otherwise passed straight through
// into the Location header: browsers parse "https://objely.app@evil.example/x"
// as userinfo (objely.app) + host (evil.example), silently sending an
// authenticated user to an attacker's page right after a real login —
// exactly the kind of link that reads as trustworthy since it starts as a
// genuine objely.app click. Same check login/page.tsx and signInWithGoogle
// already apply before a `next` ever reaches here; this is the point that
// actually redirects, so it shouldn't depend on every caller upstream
// having remembered to validate first.
function safeNextPath(rawNext: string | null): string {
  if (rawNext && rawNext.startsWith("/") && !rawNext.startsWith("//")) return rawNext;
  return "/home";
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"));
  const errorDescription = searchParams.get("error_description");

  if (errorDescription) {
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(errorDescription)}`);
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const separator = next.includes("?") ? "&" : "?";
      return NextResponse.redirect(`${origin}${next}${separator}welcome=1`);
    }
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`);
  }

  return NextResponse.redirect(`${origin}/login`);
}
