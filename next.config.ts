import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "nmjvehtzooqipvakntlo.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        // Preset profile avatars (src/lib/presetAvatars.ts) — served as SVG.
        protocol: "https",
        hostname: "api.dicebear.com",
        pathname: "/**",
      },
    ],
    // Required to let next/image serve the dicebear SVGs above. Safe here
    // since the only SVG source is this one fixed, trusted API (never
    // user-uploaded), and the CSP below blocks any embedded script from
    // running regardless.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  async headers() {
    return [
      {
        // Always revalidate the service worker itself so clients pick up
        // a new version promptly instead of running a stale one forever.
        source: "/sw.js",
        headers: [{ key: "Cache-Control", value: "public, max-age=0, must-revalidate" }],
      },
    ];
  },
};

export default nextConfig;
