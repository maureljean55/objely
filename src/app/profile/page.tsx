"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import BottomNav from "@/components/BottomNav";
import { getCurrentUser } from "@/lib/auth";
import { getMyItemStats, type MyItemStats } from "@/lib/supabase/items";
import { getMyProfile } from "@/lib/supabase/profile";
import type { User } from "@supabase/supabase-js";

const EMPTY_STATS: MyItemStats = { signaled: 0, found: 0, recovered: 0 };

const MENU_ITEMS = [
  { icon: "forum", label: "Messages", description: "Vos conversations d'entraide", href: "/messages", iconBg: "bg-primary-fixed/50", iconColor: "text-primary" },
  { icon: "notifications_active", label: "Notifications", description: "Alertes de proximité & statut", href: "/profile/notifications", iconBg: "bg-secondary-fixed/50", iconColor: "text-secondary" },
  { icon: "qr_code_2", label: "Mon QR Code", description: "Partagez votre profil Objely", href: "/qr", iconBg: "bg-tertiary-fixed/60", iconColor: "text-tertiary" },
  { icon: "groups", label: "Mes communautés", description: "Gares, universités & quartiers", href: "/communities", iconBg: "bg-secondary-container/20", iconColor: "text-secondary-container" },
  { icon: "badge", label: "Vérification d'identité", description: "Obtenez le badge \"Identité vérifiée\"", href: "/profile/identity-verification", iconBg: "bg-primary-fixed/50", iconColor: "text-primary" },
  { icon: "help_center", label: "Aide & service client", description: "FAQ, guides et assistance", href: "/help", iconBg: "bg-surface-container-highest", iconColor: "text-on-surface-variant" },
  { icon: "flag", label: "Signaler un problème", description: "Signaler un abus ou un bug", href: "/profile/report", iconBg: "bg-error-container/60", iconColor: "text-error" },
] as const;

const STATS_META = [
  { key: "signaled", icon: "search", label: "Signalés", iconBg: "bg-primary-fixed", iconColor: "text-on-primary-fixed" },
  { key: "found", icon: "inventory_2", label: "Trouvés", iconBg: "bg-secondary-fixed", iconColor: "text-secondary" },
  { key: "recovered", icon: "task_alt", label: "Retrouvés", iconBg: "bg-primary-fixed-dim/40", iconColor: "text-primary" },
] as const;

const TRUST_TIERS = {
  or: {
    label: "Or",
    wash: "bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-amber-500/5",
    iconBg: "bg-amber-500/20",
    iconColor: "text-amber-600",
    labelColor: "text-amber-950",
    subColor: "text-amber-900/80",
    badge: "bg-amber-600",
  },
  argent: {
    label: "Argent",
    wash: "bg-gradient-to-r from-slate-400/15 via-slate-300/10 to-slate-400/5",
    iconBg: "bg-slate-400/20",
    iconColor: "text-slate-600",
    labelColor: "text-slate-900",
    subColor: "text-slate-700/80",
    badge: "bg-slate-600",
  },
  bronze: {
    label: "Bronze",
    wash: "bg-gradient-to-r from-orange-700/15 via-orange-600/10 to-orange-700/5",
    iconBg: "bg-orange-700/20",
    iconColor: "text-orange-800",
    labelColor: "text-orange-950",
    subColor: "text-orange-900/70",
    badge: "bg-orange-700",
  },
  nouveau: {
    label: "Nouveau",
    wash: "bg-gradient-to-r from-primary/15 via-secondary/10 to-primary/5",
    iconBg: "bg-primary/15",
    iconColor: "text-primary",
    labelColor: "text-on-surface",
    subColor: "text-on-surface-variant",
    badge: "bg-primary",
  },
} as const;

function trustTier(score: number) {
  if (score >= 70) return TRUST_TIERS.or;
  if (score >= 40) return TRUST_TIERS.argent;
  if (score >= 15) return TRUST_TIERS.bronze;
  return TRUST_TIERS.nouveau;
}

function ProfileSummary({
  user,
  authChecked,
  stats,
  avatarUrl,
  displayName,
  trustScore,
  publicId,
  identityVerified,
}: {
  user: User | null;
  authChecked: boolean;
  stats: MyItemStats;
  avatarUrl: string | null;
  displayName: string;
  trustScore: number;
  publicId: string | null;
  identityVerified: boolean;
}) {
  const authenticated = !!user;
  const tier = trustTier(trustScore);
  const [copied, setCopied] = useState(false);
  const [trustInfoOpen, setTrustInfoOpen] = useState(false);

  const handleCopyId = async () => {
    if (!publicId) return;
    try {
      await navigator.clipboard.writeText(publicId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can be denied by the browser — nothing useful to
      // do about it beyond leaving the code unselected.
    }
  };

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

      {!authChecked ? (
        // Neither the signed-in nor the guest view yet — showing either one
        // before getCurrentUser() resolves would flash the wrong state
        // (guest included, since a signed-in visitor would briefly see
        // "Connecte-toi" before their real profile pops in).
        <section className="flex flex-col items-center pt-8 pb-6">
          <div className="w-28 h-28 rounded-full bg-surface-container-high animate-pulse mb-4" />
          <div className="h-6 w-40 rounded-full bg-surface-container-high animate-pulse" />
        </section>
      ) : authenticated ? (
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
            <div className="flex items-center gap-1.5 mb-1.5">
              <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">
                {displayName}
              </h1>
              {identityVerified && (
                <span
                  className="material-symbols-outlined text-primary text-[20px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                  aria-label="Identité vérifiée"
                  title="Identité vérifiée"
                >
                  verified
                </span>
              )}
            </div>
            {publicId && (
              <button
                type="button"
                onClick={handleCopyId}
                aria-label="Copier l'identifiant public"
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-md text-[11px] tracking-wider mb-1 active:scale-95 transition-transform"
              >
                @{publicId}
                <span className="material-symbols-outlined text-[13px]">{copied ? "check" : "content_copy"}</span>
              </button>
            )}
          </section>

          <section className="relative animate-fadeIn">
            <button
              type="button"
              onClick={() => setTrustInfoOpen((v) => !v)}
              className={`w-full rounded-2xl p-3.5 flex items-center justify-between shadow-sm active:scale-[0.99] transition-transform ${tier.wash}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${tier.iconBg}`}>
                  <span className={`material-symbols-outlined text-[20px] ${tier.iconColor}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                    verified_user
                  </span>
                </div>
                <div className="flex flex-col text-left">
                  <div className="flex items-center gap-1">
                    <span className={`font-label-md text-label-md font-semibold ${tier.labelColor}`}>Niveau de confiance : {tier.label}</span>
                    <span className={`material-symbols-outlined text-[14px] ${tier.subColor}`}>info</span>
                  </div>
                  <span className={`font-body-md text-body-md text-[13px] ${tier.subColor}`}>Membre certifié Objely</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className={`text-white font-label-md text-[11px] font-bold px-2.5 py-0.5 rounded-full ${tier.badge}`}>{trustScore}%</span>
                <span className={`material-symbols-outlined text-[18px] ${tier.subColor}`}>
                  {trustInfoOpen ? "expand_less" : "chevron_right"}
                </span>
              </div>
            </button>
            {trustInfoOpen && (
              <div className="mt-2 p-4 rounded-2xl bg-inverse-surface text-inverse-on-surface shadow-xl flex items-start gap-2.5">
                <span className="material-symbols-outlined text-primary-fixed text-[18px] shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>
                  workspace_premium
                </span>
                <p className="font-body-md text-body-md text-[13px] text-inverse-on-surface/90">
                  Votre niveau de confiance reflète votre activité, les validations par scan et les restitutions d&apos;objets réussies dans la communauté Objely.
                </p>
              </div>
            )}
          </section>

          <section className="mt-4 animate-fadeIn">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="font-label-md text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">Mon activité</span>
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              {STATS_META.map((meta) => (
                <div key={meta.key} className="bg-surface-container-lowest rounded-2xl p-3 flex flex-col items-center text-center shadow-sm">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${meta.iconBg}`}>
                    <span className={`material-symbols-outlined text-[18px] ${meta.iconColor}`}>{meta.icon}</span>
                  </div>
                  <span className="font-headline-md text-headline-md text-on-surface font-bold">{stats[meta.key]}</span>
                  <span className="font-label-md text-[11px] text-on-surface-variant mt-0.5">{meta.label}</span>
                </div>
              ))}
            </div>
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
            Connectez-vous pour déclarer vos objets et suivre vos retrouvailles.
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
  const [publicId, setPublicId] = useState<string | null>(null);
  const [identityVerified, setIdentityVerified] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const displayName = profileName || (user?.user_metadata?.full_name as string | undefined) || user?.email || "";

  // The pinned mobile header's height varies with its content (e.g. the
  // public ID card only rendering once publicId loads), so the spacer below
  // that reserves room for it in the scrolling flow is measured rather than
  // a fixed guess — a hardcoded value silently drifts out of sync and ends
  // up hiding whatever is first in the menu list underneath the header.
  const mobileHeaderRef = useRef<HTMLDivElement>(null);
  const [mobileHeaderHeight, setMobileHeaderHeight] = useState(0);

  useEffect(() => {
    const el = mobileHeaderRef.current;
    if (!el) return;
    const update = () => setMobileHeaderHeight(el.offsetHeight);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    // Read after mount (not as a lazy initial state) so the server-rendered
    // guest markup matches the client's first render and hydration doesn't
    // warn about a mismatch; there's no session to read during SSR anyway.
    getCurrentUser().then((u) => {
      setUser(u);
      setAuthChecked(true);
      if (u) {
        getMyItemStats(u.id).then(setStats);
        getMyProfile().then(({ data }) => {
          setAvatarUrl(data?.avatar_url ?? null);
          setProfileName(data?.full_name ?? null);
          setTrustScore(data?.trust_score ?? 0);
          setPublicId(data?.public_id ?? null);
          setIdentityVerified(!!data?.identity_verified_at);
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
          <Link
            href="/notifications"
            className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:opacity-80 transition-opacity"
          >
            <span className="material-symbols-outlined">notifications</span>
          </Link>
        </div>
      </header>

      {/* Mobile: photo through stats stays pinned while the menu list below scrolls */}
      <div
        ref={mobileHeaderRef}
        className="md:hidden fixed top-0 inset-x-0 z-40 bg-background/95 backdrop-blur-md px-container-margin pb-4 shadow-sm"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <ProfileSummary user={user} authChecked={authChecked} stats={stats} avatarUrl={avatarUrl} displayName={displayName} trustScore={trustScore} publicId={publicId} identityVerified={identityVerified} />
      </div>

      <main className="max-w-2xl mx-auto md:mt-8 px-container-margin md:px-0 md:pt-0">
        {/* Spacer reserving room for the pinned header above (mobile only, see mobileHeaderHeight) */}
        <div className="md:hidden" style={{ height: mobileHeaderHeight }} />

        <div className="hidden md:block relative">
          <ProfileSummary user={user} authChecked={authChecked} stats={stats} avatarUrl={avatarUrl} displayName={displayName} trustScore={trustScore} publicId={publicId} identityVerified={identityVerified} />
        </div>

        <div className="px-1 mb-2.5 mt-2">
          <span className="font-label-md text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">Espace personnel</span>
        </div>
        <section className="bg-surface-container-lowest rounded-2xl soft-shadow inner-stroke overflow-hidden mb-8 animate-slideUp">
          <div className="flex flex-col">
            {MENU_ITEMS.map((item, i) => (
              <Link
                key={item.label}
                href={item.href}
                className={`w-full flex items-center justify-between p-3.5 text-left hover:bg-surface-container-low transition-colors ${
                  i < MENU_ITEMS.length - 1 ? "border-b border-surface-container-high" : ""
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${item.iconBg} ${item.iconColor}`}>
                    <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="font-label-lg text-label-lg text-on-surface">{item.label}</div>
                    <div className="font-body-md text-body-md text-[13px] text-on-surface-variant truncate">{item.description}</div>
                  </div>
                </div>
                <span className="material-symbols-outlined text-outline-variant text-[20px] shrink-0">chevron_right</span>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <BottomNav active="profile" />
    </div>
  );
}
