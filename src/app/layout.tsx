import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import SessionGuard from "@/components/SessionGuard";

// Self-hosted at build time (no render-blocking request to fonts.googleapis.com
// on every cold load) — exposed as a CSS variable so Tailwind's fontFamily
// config (see tailwind.config.ts) can reference it.
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-plus-jakarta-sans",
});

export const metadata: Metadata = {
  applicationName: "Objely",
  title: {
    default: "Objely — Retrouvez ce qui compte pour vous",
    template: "%s · Objely",
  },
  description:
    "Objely vous aide à déclarer, rechercher et retrouver vos objets perdus grâce à une mise en correspondance intelligente et sécurisée.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Objely",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#0058bc",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

const THEME_INIT_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem("objely-theme");
    var dark = stored ? stored === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle("dark", dark);
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" suppressHydrationWarning className={plusJakartaSans.variable}>
      <head>
        {/* Runs before paint so the stored/system theme applies with no flash. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        {/* Material Symbols is an icon font next/font/google doesn't carry in
            its catalog, so it stays a regular Google Fonts request. */}
        <link href="https://fonts.googleapis.com" rel="preconnect" />
        <link href="https://fonts.gstatic.com" rel="preconnect" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-background font-body-md text-on-background antialiased">
        {children}
        <ServiceWorkerRegister />
        <SessionGuard />
      </body>
    </html>
  );
}
