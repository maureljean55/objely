"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import BottomNav from "@/components/BottomNav";
import ThemeToggle from "@/components/ThemeToggle";
import { getCurrentUser } from "@/lib/auth";
import { getMyItemStats, type MyItemStats } from "@/lib/supabase/items";
import { getMyProfile } from "@/lib/supabase/profile";
import type { User } from "@supabase/supabase-js";

const EMPTY_STATS: MyItemStats = { signaled: 0, found: 0, recovered: 0 };

const MENU_ITEMS_TOP = [
  { icon: "chat_bubble", label: "Messages", gradient: "linear-gradient(135deg, #0058bc, #5952af)", href: "/messages" },
];

const MENU_ITEMS_BOTTOM = [
  { icon: "notifications", label: "Notifications", gradient: "linear-gradient(135deg, #0058bc, #3b82f6)", href: "/profile/notifications" },
  { icon: "help", label: "Aide", gradient: "linear-gradient(135deg, #06b6d4, #0891b2)", href: "/help" },
  { icon: "flag", label: "Signaler un problème", gradient: "linear-gradient(135deg, #f97316, #ef4444)", href: "/profile/report" },
];

const STATS_META = [
  { key: "signaled", icon: "search", label: "Objets\nsignalés", color: "#0058bc" },
  { key: "found", icon: "inventory_2", label: "Objets\ntrouvés", color: "#5952af" },
  { key: "recovered", icon: "check_circle", label: "Retrouvés", color: "#16a34a" },
] as const;

function trustTier(score: number) {
  if (score >= 70) {
    return { label: "Or", gradient: "linear-gradient(135deg, #f6b93b, #d9822b)" };
  }
  if (score >= 40) {
    return { label: "Argent", gradient: "linear-gradient(135deg, #9aa6b8, #6b7688)" };
  }
  if (score >= 15) {
    return { label: "Bronze", gradient: "linear-gradient(135deg, #e59a5f, #b8622a)" };
  }
  return { label: "Nouveau", gradient: "linear-gradient(135deg, #0058bc, #5952af)" };
}

function ProfileSummary({
  user,
  stats,
  avatarUrl,
  displayName,
  trustScore,
}: {
  user: User | null;
  stats: MyItemStats;
  avatarUrl: string | null;
  displayName: string;
  trustScore: number;
}) {
  const authenticated = !!user;
  const tier = trustTier(trustScore);

  return (
    <>
      <Link
        href="/profile/settings"
        aria-label="Paramètres du compte"
        className="absolute right-container-margin md:right-0 w-10 h-10 rounded-full bg-surface-container-lowest shadow-sm flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
        style={{ top: "calc(1rem + env(safe-area-inset-top))" }}
      >
        <span className="material-symbols-outlined text-[20px]">settings</span>
      </Link>

      {authenticated ? (
        <>
          <section className="flex flex-col items-center pt-8 pb-6 animate-fadeIn">
            <div className="relative mb-4">
              <div
                className="w-28 h-28 rounded-full p-[3px] shadow-lg"
                style={{ background: "linear-gradient(135deg, #0058bc, #8b5cf6)" }}
              >
                <div className="relative w-full h-full rounded-full overflow-hidden bg-surface-container-high flex items-center justify-center text-on-surface-variant ring-4 ring-surface-container-lowest">
                  {avatarUrl ? (
                    <Image alt={displayName} src={avatarUrl} fill sizes="112px" className="object-cover" priority />
                  ) : (
                    <span className="material-symbols-outlined text-[52px]">person</span>
                  )}
                </div>
              </div>
              <Link href="/profile/edit" className="absolute bottom-0 right-0 w-8 h-8 bg-surface-container-lowest rounded-full shadow-md flex items-center justify-center text-primary hover:bg-surface-variant transition-colors border border-surface-container">
                <span className="material-symbols-outlined text-[18px]">edit</span>
              </Link>
            </div>
            <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-2">
              {displayName}
            </h1>
            <div
              className="flex items-center gap-2 rounded-full px-4 py-1.5 shadow-md mt-1 text-white"
              style={{ background: tier.gradient }}
            >
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                shield
              </span>
              <span className="font-label-md text-label-md text-white">
                Niveau de confiance : {tier.label} ({trustScore}%)
              </span>
            </div>
          </section>

          <section className="grid grid-cols-3 gap-3 animate-slideUp">
            {STATS_META.map((meta) => (
              <div key={meta.key} className="bg-surface-container-lowest rounded-[24px] p-4 flex flex-col items-center justify-center gap-1 soft-shadow inner-stroke">
                <span className="material-symbols-outlined text-[20px]" style={{ color: meta.color }}>
                  {meta.icon}
                </span>
                <span className="font-headline-lg-mobile text-headline-lg-mobile" style={{ color: meta.color }}>
                  {stats[meta.key]}
                </span>
                <span className="font-label-md text-label-md text-on-surface-variant text-center leading-tight whitespace-pre-line">
                  {meta.label}
                </span>
              </div>
            ))}
          </section>
        </>
      ) : (
        <section className="flex flex-col items-center text-center pt-10 pb-6 animate-fadeIn">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center mb-5 shadow-lg"
            style={{ background: "linear-gradient(135deg, #0058bc, #5952af)" }}
          >
            <span className="material-symbols-outlined text-white text-[36px]">person</span>
          </div>
          <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-2">
            Bienvenue sur Objely
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant text-center max-w-xs mb-5">
            Connecte-toi pour déclarer tes objets et suivre tes retrouvailles.
          </p>
          <Link
            href="/login"
            className="px-8 py-3 rounded-full text-white font-body-lg text-body-lg font-bold shadow-md hover:opacity-90 transition-opacity"
            style={{ background: "linear-gradient(135deg, #0058bc, #5952af)" }}
          >
            Se connecter
          </Link>
          <Link href="/register" className="font-label-md text-label-md text-primary mt-4 hover:underline">
            Pas de compte ? Créer un compte
          </Link>
        </section>
      )}
    </>
  );
}

export default function UserProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<MyItemStats>(EMPTY_STATS);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [profileName, setProfileName] = useState<string | null>(null);
  const [trustScore, setTrustScore] = useState(0);
  const displayName = profileName || (user?.user_metadata?.full_name as string | undefined) || user?.email || "";

  useEffect(() => {
    // Read after mount (not as a lazy initial state) so the server-rendered
    // guest markup matches the client's first render and hydration doesn't
    // warn about a mismatch; there's no session to read during SSR anyway.
    getCurrentUser().then((u) => {
      setUser(u);
      if (u) {
        getMyItemStats(u.id).then(setStats);
        getMyProfile().then(({ data }) => {
          setAvatarUrl(data?.avatar_url ?? null);
          setProfileName(data?.full_name ?? null);
          setTrustScore(data?.trust_score ?? 0);
        });
      }
    });
  }, []);

  return (
    <div className="bg-background text-on-surface antialiased pb-[100px]">
      <header
        className="hidden md:flex justify-between items-center w-full px-container-margin pb-base max-w-7xl mx-auto bg-background/80 backdrop-blur-md sticky top-0 z-50"
        style={{ paddingTop: "calc(0.5rem + env(safe-area-inset-top))" }}
      >
        <div className="font-display text-display text-primary">Objely</div>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-surface-variant overflow-hidden" />
          <span className="font-headline-sm text-headline-sm text-primary">Bonjour 👋</span>
          <button className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:opacity-80 transition-opacity">
            <span className="material-symbols-outlined">notifications</span>
          </button>
        </div>
      </header>

      {/* Mobile: photo through stats stays pinned while the menu list below scrolls */}
      <div
        className="md:hidden fixed top-0 inset-x-0 z-40 bg-background/95 backdrop-blur-md px-container-margin pb-4 shadow-sm"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <ProfileSummary user={user} stats={stats} avatarUrl={avatarUrl} displayName={displayName} trustScore={trustScore} />
      </div>

      <main className="max-w-2xl mx-auto md:mt-8 px-container-margin md:px-0 pt-[calc(392px+env(safe-area-inset-top))] md:pt-0">
        <div className="hidden md:block relative">
          <ProfileSummary user={user} stats={stats} avatarUrl={avatarUrl} displayName={displayName} trustScore={trustScore} />
        </div>

        <section className="bg-surface-container-lowest rounded-[32px] soft-shadow inner-stroke overflow-hidden mb-8 animate-slideUp">
          <div className="flex flex-col">
            {MENU_ITEMS_TOP.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="w-full flex items-center justify-between p-lg text-left hover:bg-black/[0.02] transition-colors border-b border-surface-variant/50"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-sm" style={{ background: item.gradient }}>
                    <span className="material-symbols-outlined">{item.icon}</span>
                  </div>
                  <span className="font-body-lg text-body-lg text-on-surface">{item.label}</span>
                </div>
                <span className="material-symbols-outlined text-outline-variant">chevron_right</span>
              </Link>
            ))}

            <ThemeToggle />

            {MENU_ITEMS_BOTTOM.map((item, i) => {
              const rowClassName = `w-full flex items-center justify-between p-lg text-left hover:bg-black/[0.02] transition-colors ${
                i < MENU_ITEMS_BOTTOM.length - 1 ? "border-b border-surface-variant/50" : ""
              }`;
              const content = (
                <>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-sm" style={{ background: item.gradient }}>
                      <span className="material-symbols-outlined">{item.icon}</span>
                    </div>
                    <span className="font-body-lg text-body-lg text-on-surface">{item.label}</span>
                  </div>
                  <span className="material-symbols-outlined text-outline-variant">chevron_right</span>
                </>
              );
              return item.href ? (
                <Link key={item.label} href={item.href} className={rowClassName}>
                  {content}
                </Link>
              ) : (
                <button key={item.label} className={rowClassName}>
                  {content}
                </button>
              );
            })}
          </div>
        </section>
      </main>

      <BottomNav active="profile" />
    </div>
  );
}
