import Link from "next/link";
import Image from "next/image";
import BottomNav from "@/components/BottomNav";
import MessagesFab from "@/components/MessagesFab";
import { createClient } from "@/lib/supabase/server";
import { listRecentFinds } from "@/lib/supabase/publicFeed";
import styles from "./home.module.css";

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

  const [{ count: unreadCount }, { count: unreadMessageCount }, { data: profile }] = user
    ? await Promise.all([
        supabase.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("read", false),
        supabase
          .from("notifications")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("type", "message")
          .eq("read", false),
        supabase.from("profiles").select("avatar_url").eq("id", user.id).maybeSingle<{ avatar_url: string | null }>(),
      ])
    : [{ count: 0 }, { count: 0 }, { data: null }];

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
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.brand}>
            <Image src="/illustrations/home/logo.png" alt="Objely" width={376} height={120} className={styles.logo} priority />
            <span>Perdu. Trouvé. Retrouvé.</span>
          </div>

          <div className={styles.headerRight}>
            <Link href="/notifications" aria-label="Notifications" className={styles.circleButton}>
              <span className="material-symbols-outlined">notifications</span>
              {!!unreadCount && <i className={styles.notificationDot} />}
            </Link>

            <Link href="/profile" aria-label="Profil" className={styles.profileButton}>
              {profile?.avatar_url ? (
                <Image src={profile.avatar_url} alt="Profil" width={52} height={52} />
              ) : (
                <span className="material-symbols-outlined" style={{ fontSize: 24 }}>person</span>
              )}
              <span className={styles.online} />
            </Link>
          </div>
        </header>

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
          <div className={styles.welcome}>Bienvenue sur Objely&nbsp;!</div>
          <h1>
            Ton objet peut tout
            <br />
            <strong>changer&nbsp;!</strong>
          </h1>
          <p>Perds un objet. Retrouve-le. Ou aide les autres&nbsp;!</p>
        </section>

        {/* Actions */}
        <section className={styles.actions}>
          <Link href="/report-lost" className={`${styles.actionCard} ${styles.lost}`}>
            <div className={styles.actionTop}>
              <span className={styles.actionIcon}>
                <Image src="/illustrations/home/mascot.png" alt="" width={34} height={34} className={styles.actionIconImg} />
              </span>
              <span className={styles.actionArrow}>
                <span className="material-symbols-outlined" style={{ fontSize: 19 }}>chevron_right</span>
              </span>
            </div>
            <div className={styles.actionBody}>
              <h2>
                Découvrir
                <br />
                un objet perdu
              </h2>
              <p>Aide à le retrouver</p>
            </div>
          </Link>

          <Link href="/report-found" className={`${styles.actionCard} ${styles.found}`}>
            <div className={styles.actionTop}>
              <span className={`${styles.actionIcon} ${styles.actionIconDiamond}`}>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>diamond</span>
              </span>
              <span className={styles.actionArrow}>
                <span className="material-symbols-outlined" style={{ fontSize: 19 }}>chevron_right</span>
              </span>
            </div>
            <div className={styles.actionBody}>
              <h2>
                Déclarer
                <br />
                un objet trouvé
              </h2>
              <p>Rends-le à son propriétaire</p>
            </div>
          </Link>
        </section>

        {/* Communauté */}
        <section className={styles.community}>
          <div className={styles.communityContent}>
            <div className={styles.communityIcon}>👥</div>
            <h2>
              Une communauté
              <br />
              solidaire
            </h2>
            <p>
              Des milliers de personnes
              <br />
              déjà actives près de chez toi.
            </p>
            <Link href="/profile" className={styles.joinButton}>
              Rejoindre →
            </Link>
          </div>
          <Image
            src="/illustrations/home/couple.png"
            alt="Deux utilisateurs Objely qui consultent l'app ensemble"
            width={225}
            height={180}
            className={styles.communityImage}
          />
        </section>

        {/* Objets récents — vraies données */}
        <section>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>🛍️</span>
              <h2>Objets récemment trouvés</h2>
            </div>
            <Link href="/search" className={styles.seeAll}>
              Voir tout →
            </Link>
          </div>

          {recentFinds && recentFinds.length > 0 ? (
            <div className={styles.objectsList}>
              {recentFinds.map((item, index) => (
                <article key={item.id} className={styles.objectCard}>
                  <div className={styles.objectImage}>
                    {item.photos?.[0] ? (
                      <Image
                        src={item.photos[0]}
                        alt={item.title}
                        fill
                        sizes="150px"
                        style={{ objectFit: "contain", padding: 10 }}
                        priority={index === 0}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-4xl">{item.category_icon || "inventory_2"}</span>
                      </div>
                    )}
                    <span className={styles.verified}>✓</span>
                  </div>
                  <span className={styles.objectTag}>{item.category_label}</span>
                  <p className={styles.place}>📍 {item.location || "Lieu non précisé"}</p>
                  <p className={styles.time}>{timeAgo(item.created_at)}</p>
                </article>
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
          <Link
            href="/report-lost"
            className="relative overflow-hidden text-white p-lg flex flex-col justify-center gap-1.5 min-h-[190px] rounded-[30px] transition-transform hover:scale-[0.98]"
            style={{
              background: "linear-gradient(150deg, #3aa4ff 0%, #1c7ef0 55%, #0f5fd6 100%)",
              boxShadow: "0 18px 34px rgba(20, 100, 220, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.35)",
            }}
          >
            <div
              className="pointer-events-none absolute inset-0"
              style={{ background: "radial-gradient(160px 120px at 12% -8%, rgba(255,255,255,0.4), transparent 60%)" }}
            />
            <div className="relative z-[1] flex items-start justify-between">
              <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center text-[#2873dc] shadow-sm">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>search</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-white/25 flex items-center justify-center">
                <span className="material-symbols-outlined" style={{ fontSize: 19 }}>chevron_right</span>
              </div>
            </div>
            <h2 className="relative z-[1] font-headline-lg-mobile text-headline-lg-mobile">Découvrir un objet perdu</h2>
            <p className="relative z-[1] font-body-md text-body-md text-white/85">Aide à le retrouver</p>
          </Link>

          <Link
            href="/report-found"
            className="relative overflow-hidden text-white p-lg flex flex-col justify-center gap-1.5 min-h-[190px] rounded-[30px] transition-transform hover:scale-[0.98]"
            style={{
              background: "linear-gradient(150deg, #b6a4ff 0%, #9377f5 55%, #7c5cf0 100%)",
              boxShadow: "0 18px 34px rgba(110, 80, 220, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.35)",
            }}
          >
            <div
              className="pointer-events-none absolute inset-0"
              style={{ background: "radial-gradient(160px 120px at 12% -8%, rgba(255,255,255,0.4), transparent 60%)" }}
            />
            <div className="relative z-[1] flex items-start justify-between">
              <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center text-[#8c78f5] shadow-sm">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>front_hand</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-white/25 flex items-center justify-center">
                <span className="material-symbols-outlined" style={{ fontSize: 19 }}>chevron_right</span>
              </div>
            </div>
            <h2 className="relative z-[1] font-headline-lg-mobile text-headline-lg-mobile">Déclarer un objet trouvé</h2>
            <p className="relative z-[1] font-body-md text-body-md text-white/85">Rends-le à son propriétaire</p>
          </Link>
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

      <BottomNav active="home" />
    </div>
  );
}
