import type { NextRequest } from "next/server";

const EXCLUDED_PREFIXES = ["/api/"];
// Technical routes a browser/PWA fetches on its own (manifest, robots,
// sitemap) — not proxy-matcher-excluded like images are, but not a page
// anyone "visited" either, so they'd otherwise pollute the top-pages ranking.
const EXCLUDED_EXACT_PATHS = new Set(["/manifest.webmanifest", "/robots.txt", "/sitemap.xml"]);

/**
 * Decides whether a request is a real navigation worth counting, as opposed
 * to a background prefetch (hover/viewport link preloading triggers a real
 * HTTP request too, just one nobody actually looked at) or an API/server
 * action call routed through the same proxy matcher.
 */
export function shouldRecordPageView(request: NextRequest): boolean {
  if (request.method !== "GET") return false;
  if (EXCLUDED_PREFIXES.some((prefix) => request.nextUrl.pathname.startsWith(prefix))) return false;
  if (EXCLUDED_EXACT_PATHS.has(request.nextUrl.pathname)) return false;
  if (request.headers.get("next-router-prefetch")) return false;
  if (request.headers.get("purpose") === "prefetch" || request.headers.get("sec-purpose")?.includes("prefetch")) return false;
  return true;
}

/** Best-effort beacon insert — never throws, since a lost page view is fine but a crashed request isn't. */
export async function recordPageView(path: string, userId: string | null): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return;

  try {
    await fetch(`${url}/rest/v1/page_views`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ path, user_id: userId }),
    });
  } catch (error) {
    console.error("Failed to record page view", error);
  }
}
