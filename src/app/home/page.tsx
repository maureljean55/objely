import Link from "next/link";
import Image from "next/image";
import BottomNav from "@/components/BottomNav";
import NotificationTicker from "@/components/NotificationTicker";
import MessagesFab from "@/components/MessagesFab";
import { createClient } from "@/lib/supabase/server";
import { getServerTranslations } from "@/lib/i18n/server";
import { formatTimeAgo } from "@/lib/i18n/timeAgo";
import type { Item } from "@/lib/supabase/items";

export default async function HomeDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string }>;
}) {
  const { welcome } = await searchParams;
  const supabase = await createClient();
  const t = await getServerTranslations();

  // recentFinds doesn't depend on the user, so it can run alongside the
  // auth check instead of waiting behind it.
  const [{ data: recentFinds }, {
    data: { user },
  }] = await Promise.all([
    supabase
      .from("items")
      .select("*")
      .eq("type", "found")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(6)
      .returns<Item[]>(),
    supabase.auth.getUser(),
  ]);

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
    <div className="pt-[calc(172px+env(safe-area-inset-top))] pb-[120px] md:pt-[calc(100px+env(safe-area-inset-top))] md:pb-0">
      {/* TopAppBar (mobile) — fixed, stays put while the body scrolls */}
      <header
        className="md:hidden fixed top-0 inset-x-0 z-40 flex flex-col gap-md px-container-margin pb-md bg-background/90 backdrop-blur-md"
        style={{ paddingTop: "calc(0.75rem + env(safe-area-inset-top))" }}
      >
        <div className="flex justify-between items-center">
          <Link href="/profile" className="relative">
            <div className="relative w-11 h-11 rounded-full overflow-hidden ring-2 ring-surface-container-lowest shadow-sm bg-surface-container-high flex items-center justify-center text-on-surface-variant">
              {profile?.avatar_url ? (
                <Image alt="Profil" src={profile.avatar_url} fill sizes="44px" className="object-cover" />
              ) : (
                <span className="material-symbols-outlined text-[22px]">person</span>
              )}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-surface-container-lowest" />
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/notifications"
              aria-label="Notifications"
              className="relative w-11 h-11 rounded-full bg-surface-container-lowest shadow-sm flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-[22px]">notifications</span>
              {!!unreadCount && (
                <span className="absolute top-2.5 right-3 w-2 h-2 rounded-full bg-error ring-2 ring-surface-container-lowest" />
              )}
            </Link>
            <Link
              href="/qr"
              aria-label={t.home.scanQr}
              className="w-11 h-11 rounded-full bg-surface-container-lowest shadow-sm flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-[22px]">qr_code_scanner</span>
            </Link>
          </div>
        </div>

        <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-background">
          {t.home.question}
        </h1>

        <NotificationTicker />
      </header>

      {/* TopAppBar (desktop) */}
      <header
        className="hidden md:flex justify-between items-center w-full px-container-margin pb-base max-w-7xl mx-auto fixed top-0 z-50 bg-background/80 backdrop-blur-md"
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
            {t.nav.home}
          </Link>
          <Link className="text-on-surface-variant font-label-md text-label-md hover:opacity-80 transition-opacity flex flex-col items-center" href="/search">
            <span className="material-symbols-outlined mb-1">search</span>
            {t.nav.myItems}
          </Link>
          <Link className="text-on-surface-variant font-label-md text-label-md hover:opacity-80 transition-opacity flex flex-col items-center" href="/activity">
            <span className="material-symbols-outlined mb-1">explore</span>
            {t.nav.activity}
          </Link>
          <Link className="text-on-surface-variant font-label-md text-label-md hover:opacity-80 transition-opacity flex flex-col items-center" href="/profile">
            <span className="material-symbols-outlined mb-1">person</span>
            {t.nav.profile}
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

      <main className="max-w-7xl mx-auto px-container-margin md:px-lg pt-lg md:pt-xl space-y-lg">
        {welcome === "1" && (
          <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 border border-emerald-200/60 px-4 py-3 animate-fadeIn">
            <span className="material-symbols-outlined text-emerald-600" style={{ fontVariationSettings: "'FILL' 1" }}>
              check_circle
            </span>
            <p className="font-body-md text-body-md text-emerald-800">
              {t.home.welcomeBanner}
            </p>
          </div>
        )}

        {/* Greeting (desktop only — mobile shows this pinned in the fixed header above) */}
        <div className="hidden md:block">
          <h1 className="font-headline-lg text-headline-lg text-on-background">{t.home.question}</h1>
        </div>

        {/* Recent Activity Notification (desktop only) */}
        <div className="hidden md:block max-w-sm">
          <NotificationTicker />
        </div>

        {/* Primary Action Cards */}
        <section className="flex flex-col gap-lg md:grid md:grid-cols-2 md:gap-lg md:pt-2">
          <Link
            href="/report-lost"
            className="w-[88%] self-start md:w-auto md:self-auto bg-gradient-to-br from-primary to-primary-container text-white p-lg flex flex-col justify-center gap-1.5 shadow-xl min-h-[190px] rounded-tl-[56px] rounded-tr-[110px] rounded-br-[40px] rounded-bl-[100px] md:rounded-[28px] transition-transform hover:scale-[0.98] active:scale-[0.96]"
          >
            <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center mb-1">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>search</span>
            </div>
            <h2 className="font-headline-lg-mobile text-headline-lg-mobile">{t.home.lostCta}</h2>
            <p className="font-body-md text-body-md text-white/80">{t.home.lostSubtitle}</p>
          </Link>

          <Link
            href="/report-found"
            className="w-[80%] self-end md:w-auto md:self-auto bg-gradient-to-br from-[#7c6ff0] to-secondary-container text-white p-lg flex flex-col justify-center gap-1.5 shadow-xl min-h-[190px] rounded-tl-[110px] rounded-tr-[56px] rounded-br-[100px] rounded-bl-[40px] md:rounded-[28px] transition-transform hover:scale-[0.98] active:scale-[0.96]"
          >
            <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center mb-1">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>front_hand</span>
            </div>
            <h2 className="font-headline-lg-mobile text-headline-lg-mobile">{t.home.foundCta}</h2>
            <p className="font-body-md text-body-md text-white/80">{t.home.foundSubtitle}</p>
          </Link>
        </section>

        {/* Recent Finds — community notifications, not links to a specific item */}
        <section className="space-y-md pt-2">
          <h3 className="font-headline-sm text-headline-sm text-on-background">{t.home.recentFindsTitle}</h3>
          {recentFinds && recentFinds.length > 0 ? (
            <div className="flex overflow-x-auto md:grid md:grid-cols-3 gap-md pb-md hide-scrollbar -mx-container-margin px-container-margin md:mx-0 md:px-0">
              {recentFinds.map((item) => (
                <div key={item.id} className="flex flex-col min-w-[200px] max-w-[200px] md:min-w-0 md:max-w-none shrink-0">
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    <span className="font-label-md text-label-md text-on-surface-variant">{item.location || t.home.noLocation}</span>
                  </div>
                  <div className="relative h-32 rounded-2xl overflow-hidden bg-surface-container-high mb-2 flex items-center justify-center text-primary">
                    {item.photos?.[0] ? (
                      <Image alt={item.title} src={item.photos[0]} fill sizes="200px" className="object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-4xl">{item.category_icon || "inventory_2"}</span>
                    )}
                  </div>
                  <h4 className="font-headline-sm text-headline-sm text-on-background line-clamp-1 mb-0.5">{item.title}</h4>
                  <p className="font-body-md text-body-md text-on-surface-variant">{t.home.foundPrefix} {formatTimeAgo(item.created_at, t)}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl bg-surface-container-lowest soft-shadow p-lg text-center">
              <p className="font-body-md text-body-md text-on-surface-variant">
                {t.home.noRecentFinds}
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
