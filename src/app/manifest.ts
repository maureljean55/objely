import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Objely — Retrouvez ce qui compte pour vous",
    short_name: "Objely",
    description:
      "Objely vous aide à déclarer, rechercher et retrouver vos objets perdus grâce à une mise en correspondance intelligente et sécurisée.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    lang: "fr",
    // Matches the splash screen's gradient start (src/app/page.tsx) — iOS
    // shows this as the native launch background before any web content
    // paints, so a near-white value here reads as a blank/broken flash
    // instead of a seamless continuation into the real splash screen.
    background_color: "#0058bc",
    theme_color: "#0058bc",
    categories: ["lifestyle", "utilities"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-192-maskable.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      {
        name: "Déclarer un objet perdu",
        short_name: "Déclarer",
        url: "/report-lost",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "Rechercher un objet",
        short_name: "Rechercher",
        url: "/search",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
    ],
  };
}
