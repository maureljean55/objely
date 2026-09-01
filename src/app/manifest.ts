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
    background_color: "#f9f9fe",
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
