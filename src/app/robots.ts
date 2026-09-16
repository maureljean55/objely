import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/login", "/register", "/help", "/rgpd", "/cgu"],
      // Everything else needs a session to mean anything (dashboard, chat,
      // declarations, ...) or exposes user data — not worth crawling.
      disallow: [
        "/home",
        "/profile",
        "/messages",
        "/notifications",
        "/activity",
        "/search",
        "/chat",
        "/dm",
        "/report-lost",
        "/report-found",
        "/ownership-verification",
        "/qr",
        "/api",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
