import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  // The splash screen is pure static animation — it doesn't render anything
  // user-specific and always redirects to /home client-side regardless of
  // auth state. Skipping the session check here means it paints instantly
  // instead of waiting on a Supabase round trip first, which matters most
  // on a cold PWA launch on iOS (this is the screen shown right after the
  // native launch image, so any delay here reads as "stuck on blank white").
  if (request.nextUrl.pathname === "/") {
    return NextResponse.next();
  }

  return updateSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
