"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import BottomNav from "@/components/BottomNav";
import ThemeToggle from "@/components/ThemeToggle";
import { getCurrentUser } from "@/lib/auth";
import { getMyItemStats, type MyItemStats } from "@/lib/supabase/items";
import { getMyProfile } from "@/lib/supabase/profile";
import { useLanguage } from "@/components/LanguageProvider";
import type { TranslationDict } from "@/lib/i18n/translations";
import type { User } from "@supabase/supabase-js";

const EMPTY_STATS: MyItemStats = { signaled: 0, found: 0, recovered: 0 };

function trustTier(score: number, t: TranslationDict) {
  if (score >= 70) {
    return { label: t.profile.tierGold, badge: "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200/50", icon: "text-amber-500", text: "text-amber-700" };
  }
  if (score >= 40) {
    return { label: t.profile.tierSilver, badge: "bg-gradient-to-r from-slate-50 to-gray-100 border-slate-200/60", icon: "text-slate-500", text: "text-slate-700" };
  }
  if (score >= 15) {
    return { label: t.profile.tierBronze, badge: "bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200/50", icon: "text-orange-700", text: "text-orange-800" };
  }
  return { label: t.profile.tierNew, badge: "bg-surface-container border-outline-variant/40", icon: "text-on-surface-variant", text: "text-on-surface-variant" };
}

function ProfileSummary({
  user,
  stats,
  avatarUrl,
  displayName,
  trustScore,
  t,
}: {
  user: User | null;
  stats: MyItemStats;
  avatarUrl: string | null;
  displayName: string;
  trustScore: number;
  t: TranslationDict;
}) {
  const authenticated = !!user;
  const tier = trustTier(trustScore, t);

  return (
    <>
      <Link
        href="/profile/settings"
        aria-label={t.profile.settingsAria}
        className="absolute right-container-margin md:right-0 w-10 h-10 rounded-full bg-surface-container-lowest shadow-sm flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
        style={{ top: "calc(1rem + env(safe-area-inset-top))" }}
      >
        <span className="material-symbols-outlined text-[20px]">settings</span>
      </Link>

      {authenticated ? (
        <>
          <section className="flex flex-col items-center pt-8 pb-6 animate-fadeIn">
            <div className="relative mb-4">
              <div className="relative w-28 h-28 rounded-full overflow-hidden soft-shadow ring-4 ring-surface-container-lowest bg-surface-container-high flex items-center justify-center text-on-surface-variant">
                {avatarUrl ? (
                  <Image alt={displayName} src={avatarUrl} fill sizes="112px" className="object-cover" priority />
                ) : (
                  <span className="material-symbols-outlined text-[52px]">person</span>
                )}
              </div>
              <Link href="/profile/edit" className="absolute bottom-0 right-0 w-8 h-8 bg-surface-container-lowest rounded-full shadow-md flex items-center justify-center text-primary hover:bg-surface-variant transition-colors border border-surface-container">
                <span className="material-symbols-outlined text-[18px]">edit</span>
              </Link>
            </div>
            <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-1">
              {displayName}
            </h1>
            <div className={`flex items-center gap-2 border rounded-full px-4 py-1.5 shadow-sm mt-2 ${tier.badge}`}>
              <span className={`material-symbols-outlined text-[18px] drop-shadow-sm ${tier.icon}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                shield
              </span>
              <span className={`font-label-md text-label-md ${tier.text}`}>
                {t.profile.trustLevel} : {tier.label} ({trustScore}%)
              </span>
            </div>
          </section>

          <section className="grid grid-cols-3 gap-3 animate-slideUp">
            {[
              { value: stats.signaled, label: t.profile.statSignaled, color: "text-primary" },
              { value: stats.found, label: t.profile.statFound, color: "text-secondary" },
              { value: stats.recovered, label: t.profile.statRecovered, color: "text-tertiary" },
            ].map((stat) => (
              <div key={stat.label} className="bg-surface-container-lowest rounded-[24px] p-4 flex flex-col items-center justify-center soft-shadow inner-stroke">
                <span className={`font-headline-lg-mobile text-headline-lg-mobile mb-1 ${stat.color}`}>{stat.value}</span>
                <span className="font-label-md text-label-md text-on-surface-variant text-center leading-tight whitespace-pre-line">{stat.label}</span>
              </div>
            ))}
          </section>
        </>
      ) : (
        <section className="flex flex-col items-center pt-8 pb-6 animate-fadeIn">
          <Link
            href="/login"
            aria-label={t.profile.signIn}
            className="w-28 h-28 rounded-full border-2 border-dashed border-primary/40 bg-primary-fixed/20 flex items-center justify-center mb-4 hover:bg-primary-fixed/30 transition-colors"
          >
            <span className="material-symbols-outlined text-primary text-[36px]">login</span>
          </Link>
          <Link
            href="/login"
            className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-1 hover:underline"
          >
            {t.profile.signIn}
          </Link>
          <p className="font-body-md text-body-md text-on-surface-variant text-center max-w-xs mt-1">
            {t.profile.signInBody}
          </p>
          <Link href="/register" className="font-label-md text-label-md text-primary mt-3 hover:underline">
            {t.profile.noAccount}
          </Link>
        </section>
      )}
    </>
  );
}

export default function UserProfilePage() {
  const { t } = useLanguage();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<MyItemStats>(EMPTY_STATS);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [profileName, setProfileName] = useState<string | null>(null);
  const [trustScore, setTrustScore] = useState(0);
  const authenticated = !!user;
  const displayName = profileName || (user?.user_metadata?.full_name as string | undefined) || user?.email || "";

  const menuItemsTop = [
    { icon: "chat_bubble", label: t.profile.messages, bg: "bg-primary-fixed/30", color: "text-primary", href: "/messages" },
  ];
  const menuItemsBottom = [
    { icon: "notifications", label: t.profile.notifications, bg: "bg-primary-fixed/30", color: "text-primary", href: "/profile/notifications" },
    { icon: "help", label: t.profile.help, bg: "bg-secondary-fixed/30", color: "text-secondary", href: "/help" },
    { icon: "flag", label: t.profile.reportProblem, bg: "bg-surface-variant/50", color: "text-on-surface-variant", href: "/profile/report" },
  ];

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
          <span className="font-headline-sm text-headline-sm text-primary">{t.profile.greeting}</span>
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
        <ProfileSummary user={user} stats={stats} avatarUrl={avatarUrl} displayName={displayName} trustScore={trustScore} t={t} />
      </div>

      <main
        className={`max-w-2xl mx-auto md:mt-8 px-container-margin md:px-0 md:pt-0 ${
          authenticated ? "pt-[calc(422px+env(safe-area-inset-top))]" : "pt-[calc(300px+env(safe-area-inset-top))]"
        }`}
      >
        <div className="hidden md:block relative">
          <ProfileSummary user={user} stats={stats} avatarUrl={avatarUrl} displayName={displayName} trustScore={trustScore} t={t} />
        </div>

        <section className="bg-surface-container-lowest rounded-[32px] soft-shadow inner-stroke overflow-hidden mb-8 animate-slideUp">
          <div className="flex flex-col">
            {menuItemsTop.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="w-full flex items-center justify-between p-lg text-left hover:bg-black/[0.02] transition-colors border-b border-surface-variant/50"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.bg} ${item.color}`}>
                    <span className="material-symbols-outlined">{item.icon}</span>
                  </div>
                  <span className="font-body-lg text-body-lg text-on-surface">{item.label}</span>
                </div>
                <span className="material-symbols-outlined text-outline-variant">chevron_right</span>
              </Link>
            ))}

            <ThemeToggle />

            {menuItemsBottom.map((item, i) => {
              const rowClassName = `w-full flex items-center justify-between p-lg text-left hover:bg-black/[0.02] transition-colors ${
                i < menuItemsBottom.length - 1 ? "border-b border-surface-variant/50" : ""
              }`;
              const content = (
                <>
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.bg} ${item.color}`}>
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
