import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const PUBLIC_ROUTES: { path: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }[] = [
  { path: "/", changeFrequency: "yearly", priority: 1 },
  { path: "/register", changeFrequency: "yearly", priority: 0.8 },
  { path: "/login", changeFrequency: "yearly", priority: 0.6 },
  { path: "/help", changeFrequency: "monthly", priority: 0.5 },
  { path: "/rgpd", changeFrequency: "yearly", priority: 0.3 },
  { path: "/cgu", changeFrequency: "yearly", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return PUBLIC_ROUTES.map(({ path, changeFrequency, priority }) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
