import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import BottomNav from "@/components/BottomNav";
import MessagesFab from "@/components/MessagesFab";
import HomeHeader from "@/components/home/HomeHeader";
import GuardedActionLink from "@/components/home/GuardedActionLink";
import CookieBanner from "@/components/CookieBanner";
import { createClient } from "@/lib/supabase/server";
import { listRecentFinds } from "@/lib/supabase/publicFeed";
import type { AppNotification } from "@/lib/supabase/notifications";
import styles from "./home.module.css";

export const metadata: Metadata = {
  title: "Accueil",
  description: "Déclarez un objet perdu ou trouvé, et retrouvez les derniers objets signalés près de chez vous sur Objely.",
};

const ACTIVITY_ICONS: Record<AppNotification["type"], string> = {
  match: "search",
  message: "mark_chat_unread",
  verification_submitted: "lock_open",
  verification_confirmed: "check_circle",
  verification_rejected: "cancel",
  restitution_proposed: "event",
  restitution_responded: "event_available",
  restitution_confirmed: "task_alt",
};

function activityHref(item: AppNotification) {
  if (item.type === "message" && item.direct_conversation_id) return `/dm/${item.direct_conversation_id}`;
  if (!item.match_id) return "/activity";
  if (item.type === "message" || item.type === "restitution_proposed" || item.type === "restitution_responded" || item.type === "restitution_confirmed") {
    return `/chat/${item.match_id}`;
  }
  if (item.type === "verification_submitted") return `/activity/verification?match=${item.match_id}`;
  return "/activity";
}

function timeAgo(dateStr: string) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "à l'instant";
  if (mins < 60) return `il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "hier";
  if (days < 7) return `il y a ${days} j`;
  return new Date(dateStr).toLocaleDateString("fr-FR");
}

export default async function HomeDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string }>;
}) {
  const { welcome } = await searchParams;
  const supabase = await createClient();

  // recentFinds doesn't depend on the user, so it can run alongside the
  // auth check instead of waiting behind it — and it's cached (see
  // publicFeed.ts), so most requests don't hit Supabase for it at all.
  // getSession() reads the session middleware already validated/refreshed
  // for this request — no need to hit Supabase's Auth server a second time
  // just to read the user id.
  const [{ data: recentFinds }, {
    data: { session },
  }] = await Promise.all([listRecentFinds(6), supabase.auth.getSession()]);
  const user = session?.user ?? null;

  const [{ count: unreadCount }, { count: unreadMessageCount }, { data: profile }, { data: activities }] = user
    ? await Promise.all([
        supabase.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("read", false),
        supabase
          .from("notifications")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("type", "message")
          .eq("read", false),
        supabase.from("profiles").select("avatar_url").eq("id", user.id).maybeSingle<{ avatar_url: string | null }>(),
        supabase
          .from("notifications")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .returns<AppNotification[]>(),
      ])
    : [{ count: 0 }, { count: 0 }, { data: null }, { data: [] as AppNotification[] }];

  return (
    <div className={styles.page}>
      {/* Desktop nav — the mockup this page follows only targets phone
          widths (its own breakpoint tops out at 430px), so wider screens
          keep the app's existing simple top nav instead of an invented
          desktop redesign. Without this, md+ screens would have no
          navigation at all, since BottomNav below is mobile-only. */}
      <header
        className="hidden md:flex justify-between items-center w-full px-container-margin pb-base max-w-7xl mx-auto sticky top-0 z-50 bg-background/80 backdrop-blur-md"
        style={{ paddingTop: "calc(0.5rem + env(safe-area-inset-top))" }}
      >
        <div className="flex items-center gap-sm">
          <div className="px-3 py-1.5 rounded-xl bg-surface-container-lowest shadow-sm">
            <span className="font-headline-sm text-headline-sm text-on-surface">Objely</span>
          </div>
        </div>
        <nav className="flex gap-gutter">
          <Link className="text-primary font-label-md text-label-md hover:opacity-80 transition-opacity flex flex-col items-center" href="/home">
            <span className="material-symbols-outlined mb-1" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
            Accueil
          </Link>
          <Link className="text-on-surface-variant font-label-md text-label-md hover:opacity-80 transition-opacity flex flex-col items-center" href="/search">
            <span className="material-symbols-outlined mb-1">search</span>
            Mes objets
          </Link>
          <Link className="text-on-surface-variant font-label-md text-label-md hover:opacity-80 transition-opacity flex flex-col items-center" href="/activity">
            <span className="material-symbols-outlined mb-1">explore</span>
            Activité
          </Link>
          <Link className="text-on-surface-variant font-label-md text-label-md hover:opacity-80 transition-opacity flex flex-col items-center" href="/profile">
            <span className="material-symbols-outlined mb-1">person</span>
            Profil
          </Link>
        </nav>
        <Link href="/profile" className="relative w-10 h-10 flex items-center justify-center rounded-full surface-card overflow-hidden bg-surface-container-high text-on-surface-variant">
          {profile?.avatar_url ? (
            <Image alt="Profil" src={profile.avatar_url} fill sizes="40px" className="object-cover" />
          ) : (
            <span className="material-symbols-outlined text-[20px]">person</span>
          )}
        </Link>
      </header>

      <div className={`${styles.app} md:hidden`}>
        <HomeHeader avatarUrl={profile?.avatar_url ?? null} unreadCount={unreadCount ?? 0} />

        {welcome === "1" && (
          <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 border border-emerald-200/60 px-4 py-3 mb-lg animate-fadeIn">
            <span className="material-symbols-outlined text-emerald-600" style={{ fontVariationSettings: "'FILL' 1" }}>
              check_circle
            </span>
            <p className="font-body-md text-body-md text-emerald-800">Compte confirmé, bienvenue sur Objely !</p>
          </div>
        )}

        {/* Hero — plain, well-structured text, no side graphic */}
        <section className={styles.hero}>
          <div className={styles.welcome}>
            <svg className={styles.welcomeSpark} viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
              <path d="M13 2C13 10 15 14 22 16C15 18 13 22 13 30C13 22 11 18 4 16C11 14 13 10 13 2Z" />
              <path d="M20 2C20 5 21 6 24 7C21 8 20 9 20 12C20 9 19 8 16 7C19 6 20 5 20 2Z" />
              <path d="M6 20C6 23 7 24 10 25C7 26 6 27 6 30C6 27 5 26 2 25C5 24 6 23 6 20Z" />
            </svg>
            Bienvenue sur Objely&nbsp;!
          </div>
          <div className={styles.heroTop}>
            <div>
              <h1>
                Objets perdus,
                <br />
                <strong>objets retrouvés&nbsp;!</strong>
              </h1>
            </div>
            <p className={styles.helperNote} aria-hidden="true">
              <svg className={styles.helperArc} viewBox="0 0 20 20" fill="none">
                <path d="M18 18C18 8 12 2 2 2" stroke="url(#helperAccentGradient)" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              Une petite aide
              <br />
              peut faire une
              <br />
              grande différence
              <svg className={styles.helperTick} viewBox="0 0 20 20" fill="none">
                <path d="M4 16L16 4" stroke="url(#helperAccentGradient)" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              <svg className={styles.helperHeart} viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 20C12 20 3 14 3 8.5C3 5.5 5.3 3.5 8 3.5C9.8 3.5 11.2 4.5 12 5.8C12.8 4.5 14.2 3.5 16 3.5C18.7 3.5 21 5.5 21 8.5C21 14 12 20 12 20Z"
                  stroke="url(#helperHeartGradient)"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </svg>
              <svg width="0" height="0" style={{ position: "absolute" }}>
                <defs>
                  <linearGradient id="helperAccentGradient" x1="0" y1="0" x2="20" y2="20" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#087be8" />
                    <stop offset="1" stopColor="#a34ee9" />
                  </linearGradient>
                  <linearGradient id="helperHeartGradient" x1="3" y1="3" x2="21" y2="20" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#087be8" />
                    <stop offset="1" stopColor="#a34ee9" />
                  </linearGradient>
                </defs>
              </svg>
            </p>
          </div>
        </section>

        {/* Actions */}
        <section className={styles.actions}>
          <GuardedActionLink
            href="/report-lost"
            authenticated={!!user}
            message="Dépêche-toi de t'inscrire et on retrouvera ton objet ensemble !"
            emoji="😢"
            className={`${styles.actionCard} ${styles.lost}`}
          >
            <span className={styles.actionIcon} style={{ fontSize: 28 }}>
              😢
            </span>
            <div className={styles.actionBody}>
              <h2>Déclarer un objet perdu</h2>
              <p>Aide à le retrouver</p>
            </div>
          </GuardedActionLink>

          <GuardedActionLink
            href="/report-found"
            authenticated={!!user}
            message="Dépêche-toi de t'inscrire et aidons ensemble son propriétaire à le retrouver !"
            emoji="🤝"
            className={`${styles.actionCard} ${styles.found}`}
          >
            <span className={styles.actionIcon} style={{ fontSize: 28 }}>
              🤝
            </span>
            <div className={styles.actionBody}>
              <h2>Déclarer un objet trouvé</h2>
              <p>Rends-le à son propriétaire</p>
            </div>
          </GuardedActionLink>
        </section>

        {/* Conseils de sécurité */}
        <section>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                  shield
                </span>
              </span>
              <h2>Votre sécurité</h2>
            </div>
            <span className={styles.tipPill}>Conseil</span>
          </div>

          <div className={styles.tipCard}>
            <div className={styles.tipGlow} aria-hidden="true" />

            <div className={styles.tipBody}>
              <ul className={styles.tipList}>
                <li>
                  <span className="material-symbols-outlined">check_circle</span>
                  Privilégiez toujours un lieu public
                </li>
                <li>
                  <span className="material-symbols-outlined">check_circle</span>
                  Ne communiquez jamais vos coordonnées bancaires
                </li>
              </ul>
            </div>

            <div className={styles.tipIllustration} aria-hidden="true">
              <svg className={styles.tipSparkles} viewBox="0 0 32 32" fill="url(#tipSparkleGradient)">
                <path d="M13 2C13 10 15 14 22 16C15 18 13 22 13 30C13 22 11 18 4 16C11 14 13 10 13 2Z" />
                <defs>
                  <linearGradient id="tipSparkleGradient" x1="4" y1="2" x2="22" y2="30" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#4f7cfb" />
                    <stop offset="1" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
              <span className={styles.tipIconTile}>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                  security
                </span>
              </span>
              <span className={styles.tipNote}>
                Votre sécurité
                <br />
                compte&nbsp;!
              </span>
            </div>
          </div>
        </section>

        {/* Activités récentes — vraies notifications */}
        {user && (
          <section>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitle}>
                <span className={styles.sectionIcon}>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                    auto_awesome
                  </span>
                </span>
                <h2>Vos dernières activités</h2>
              </div>
              <Link href="/notifications" className={styles.seeAll}>
                Voir tout
                <span className="material-symbols-outlined">chevron_right</span>
              </Link>
            </div>

            {activities && activities.length > 0 ? (
              <div className={styles.activityList}>
                {activities.map((item) => (
                  <Link key={item.id} href={activityHref(item)} className={styles.activityCard}>
                    <span className={styles.activityIcon}>
                      {item.type === "message" ? (
                        <svg className={styles.activityIconSvg} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path
                            d="M12 3.5C7.03 3.5 3 7.06 3 11.5c0 2.24 1.02 4.26 2.68 5.7-.12 1-.5 2.02-1.18 2.98a.4.4 0 00.42.62c1.53-.32 2.76-.9 3.7-1.53.99.34 2.09.53 3.38.53 4.97 0 9-3.56 9-8s-4.03-8-9-8z"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <circle cx="19.6" cy="15.2" r="1" fill="white" />
                          <circle cx="21.2" cy="18.3" r="0.75" fill="white" />
                        </svg>
                      ) : (
                        <span className="material-symbols-outlined">{ACTIVITY_ICONS[item.type]}</span>
                      )}
                    </span>
                    <div className={styles.activityBody}>
                      <h3>{item.title}</h3>
                      <p>{item.body}</p>
                    </div>
                    <div className={styles.activityMeta}>
                      <span>{timeAgo(item.created_at)}</span>
                      {!item.read && <span className={styles.activityDot} />}
                      <span className="material-symbols-outlined">chevron_right</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl bg-white soft-shadow p-lg text-center">
                <p className="font-body-md text-body-md text-on-surface-variant">Aucune activité pour le moment.</p>
              </div>
            )}
          </section>
        )}

        {/* Objets récents — vraies données */}
        <section>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                  shopping_bag
                </span>
              </span>
              <h2>Objets récemment trouvés</h2>
            </div>
            <Link href="/search" className={styles.seeAll}>
              Voir tout
              <span className="material-symbols-outlined">chevron_right</span>
            </Link>
          </div>

          {recentFinds && recentFinds.length > 0 ? (
            <div className={styles.objectsList}>
              {recentFinds.map((item, index) => (
                <Link key={item.id} href={`/search/${item.id}`} className={styles.objectCard}>
                  <div className={styles.objectIcon}>
                    {item.photos?.[0] ? (
                      <Image
                        src={item.photos[0]}
                        alt={item.title}
                        fill
                        sizes="52px"
                        style={{ objectFit: "cover" }}
                        priority={index === 0}
                      />
                    ) : (
                      <span className="material-symbols-outlined">{item.category_icon || "inventory_2"}</span>
                    )}
                  </div>
                  <div className={styles.objectInfo}>
                    <h3>{item.title}</h3>
                    <p className={styles.objectMetaRow}>
                      <span className="material-symbols-outlined">location_on</span>
                      {item.location || "Lieu non précisé"}
                    </p>
                    <p className={styles.objectMetaRow}>
                      <span className="material-symbols-outlined">schedule</span>
                      {timeAgo(item.created_at)}
                    </p>
                  </div>
                  <span className={`material-symbols-outlined ${styles.objectChevron}`}>chevron_right</span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl bg-white soft-shadow p-lg text-center">
              <p className="font-body-md text-body-md text-on-surface-variant">
                Aucun objet trouvé signalé pour le moment. Revenez bientôt !
              </p>
            </div>
          )}
        </section>

        {/* Banner */}
        <section className={styles.bottomBanner}>
          <div className={styles.bannerMessage}>
            Un petit objet peut faire
            <br />
            une grande différence !
            <span>💜</span>
          </div>

          <Link href="/search" className={styles.bannerAction}>
            <span>📍</span>
            <div>
              <strong>T&apos;es du coin ?</strong>
              <small>
                Découvre les objets
                <br />
                près de chez toi !
              </small>
            </div>
            <b>›</b>
          </Link>
        </section>
      </div>

      {/* Desktop content — same real data, plain layout (see note above on
          why desktop doesn't follow the phone-only mockup). */}
      <main className="hidden md:block max-w-7xl mx-auto px-container-margin md:px-lg pt-lg md:pt-xl space-y-lg pb-2xl">
        {welcome === "1" && (
          <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 border border-emerald-200/60 px-4 py-3 animate-fadeIn">
            <span className="material-symbols-outlined text-emerald-600" style={{ fontVariationSettings: "'FILL' 1" }}>
              check_circle
            </span>
            <p className="font-body-md text-body-md text-emerald-800">Compte confirmé, bienvenue sur Objely !</p>
          </div>
        )}

        <h1 className="font-headline-lg text-headline-lg text-on-background">Quelque chose à retrouver ?</h1>

        <section className="grid grid-cols-2 gap-lg">
          <GuardedActionLink
            href="/report-lost"
            authenticated={!!user}
            message="Dépêche-toi de t'inscrire et on retrouvera ton objet ensemble !"
            emoji="😢"
            className="relative overflow-hidden text-white flex items-center gap-4 p-5 transition-transform hover:-translate-y-0.5 w-full text-left"
            style={{
              background: "linear-gradient(135deg, #1d72fe 0%, #2563eb 40%, #3b82f6 100%)",
              borderRadius: "46px",
              boxShadow: "0 14px 30px -8px rgba(37, 99, 235, 0.38), inset 0 2px 4px rgba(255, 255, 255, 0.35)",
            }}
          >
            <div
              className="pointer-events-none absolute rounded-full blur-2xl"
              style={{ width: 160, height: 160, top: -56, left: -56, background: "rgba(255,255,255,0.2)" }}
            />
            <div className="relative z-[1] w-20 h-20 shrink-0 flex items-center justify-center text-5xl">
              😢
            </div>
            <div className="relative z-[1] flex-1 min-w-0">
              <h2 className="font-headline-lg-mobile text-headline-lg-mobile">Déclarer un objet perdu</h2>
              <p className="mt-1 font-body-md text-body-md text-white/90 truncate">Aide à le retrouver</p>
            </div>
            <span
              className="relative z-[1] shrink-0 w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#1e6bfb]"
              style={{ boxShadow: "0 4px 10px rgba(0,0,0,0.15)" }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </span>
          </GuardedActionLink>

          <GuardedActionLink
            href="/report-found"
            authenticated={!!user}
            message="Dépêche-toi de t'inscrire et aidons ensemble son propriétaire à le retrouver !"
            emoji="🤝"
            className="relative overflow-hidden text-white flex items-center gap-4 p-5 transition-transform hover:-translate-y-0.5 w-full text-left"
            style={{
              background: "linear-gradient(135deg, #a78bfa 0%, #9061f9 45%, #7e4df8 100%)",
              borderRadius: "46px",
              boxShadow: "0 14px 30px -8px rgba(126, 77, 248, 0.38), inset 0 2px 4px rgba(255, 255, 255, 0.35)",
            }}
          >
            <div
              className="pointer-events-none absolute rounded-full blur-2xl"
              style={{ width: 160, height: 160, top: -56, left: -56, background: "rgba(255,255,255,0.2)" }}
            />
            <div className="relative z-[1] w-20 h-20 shrink-0 flex items-center justify-center text-5xl">
              🤝
            </div>
            <div className="relative z-[1] flex-1 min-w-0">
              <h2 className="font-headline-lg-mobile text-headline-lg-mobile">Déclarer un objet trouvé</h2>
              <p className="mt-1 font-body-md text-body-md text-white/90 truncate">Rends-le à son propriétaire</p>
            </div>
            <span
              className="relative z-[1] shrink-0 w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#8b5cf6]"
              style={{ boxShadow: "0 4px 10px rgba(0,0,0,0.15)" }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </span>
          </GuardedActionLink>
        </section>

        <section className="space-y-md">
          <div className="flex items-center justify-between">
            <h3 className="font-headline-sm text-headline-sm text-on-background">Objets récemment trouvés près de vous</h3>
            <Link href="/search" className="font-label-md text-label-md text-primary">Voir tout</Link>
          </div>
          {recentFinds && recentFinds.length > 0 ? (
            <div className="grid grid-cols-3 gap-md">
              {recentFinds.map((item) => (
                <div key={item.id} className="flex flex-col">
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    <span className="font-label-md text-label-md text-on-surface-variant">{item.location || "Lieu non précisé"}</span>
                  </div>
                  <div className="relative h-32 rounded-2xl overflow-hidden bg-surface-container-high mb-2 flex items-center justify-center text-primary">
                    {item.photos?.[0] ? (
                      <Image alt={item.title} src={item.photos[0]} fill sizes="300px" className="object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-4xl">{item.category_icon || "inventory_2"}</span>
                    )}
                  </div>
                  <h4 className="font-headline-sm text-headline-sm text-on-background line-clamp-1 mb-0.5">{item.title}</h4>
                  <p className="font-body-md text-body-md text-on-surface-variant">Trouvé {timeAgo(item.created_at)}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl bg-surface-container-lowest soft-shadow p-lg text-center">
              <p className="font-body-md text-body-md text-on-surface-variant">
                Aucun objet trouvé signalé pour le moment. Revenez bientôt !
              </p>
            </div>
          )}
        </section>
      </main>

      {user && <MessagesFab unreadCount={unreadMessageCount ?? 0} />}
      {user && <CookieBanner />}

      <BottomNav active="home" />
    </div>
  );
}
