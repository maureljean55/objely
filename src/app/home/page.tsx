import Link from "next/link";
import Image from "next/image";
import BottomNav from "@/components/BottomNav";
import MessagesFab from "@/components/MessagesFab";
import { createClient } from "@/lib/supabase/server";
import { listRecentFinds } from "@/lib/supabase/publicFeed";

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
    <div
      className="min-h-screen pb-[120px] md:pb-0"
      style={{ background: "linear-gradient(180deg, #eef1fb 0%, #f2eefc 45%, #f6f3fe 100%)" }}
    >
      {/* TopAppBar (desktop) — unchanged from before */}
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

      <main className="md:hidden max-w-7xl mx-auto px-container-margin" style={{ paddingTop: "calc(1.25rem + env(safe-area-inset-top))" }}>
        {/* Header row: wordmark + tagline, notifications / avatar */}
        <div className="flex items-start justify-between mb-lg">
          <div>
            <h1 className="font-headline-lg text-headline-lg bg-gradient-to-r from-primary to-secondary-container bg-clip-text text-transparent">
              Objely
            </h1>
            <p className="font-label-md text-label-md text-on-surface-variant -mt-1">Perdu. Trouvé. Retrouvé.</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/qr"
              aria-label="Scanner un QR code"
              className="w-11 h-11 rounded-full bg-surface-container-lowest shadow-sm flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">qr_code_scanner</span>
            </Link>
            <Link
              href="/notifications"
              aria-label="Notifications"
              className="relative w-11 h-11 rounded-full bg-surface-container-lowest shadow-sm flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              {!!unreadCount && (
                <span className="absolute top-2.5 right-3 w-2 h-2 rounded-full bg-error ring-2 ring-surface-container-lowest" />
              )}
            </Link>
            <Link href="/profile" className="relative shrink-0">
              <div className="relative w-11 h-11 rounded-full overflow-hidden ring-2 ring-surface-container-lowest shadow-sm bg-surface-container-high flex items-center justify-center text-on-surface-variant">
                {profile?.avatar_url ? (
                  <Image alt="Profil" src={profile.avatar_url} fill sizes="44px" className="object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-[22px]">person</span>
                )}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-surface-container-lowest" />
            </Link>
          </div>
        </div>

        {welcome === "1" && (
          <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 border border-emerald-200/60 px-4 py-3 mb-lg animate-fadeIn">
            <span className="material-symbols-outlined text-emerald-600" style={{ fontVariationSettings: "'FILL' 1" }}>
              check_circle
            </span>
            <p className="font-body-md text-body-md text-emerald-800">Compte confirmé, bienvenue sur Objely !</p>
          </div>
        )}

        {/* Hero */}
        <section className="relative mb-lg">
          <span className="inline-block font-label-md text-label-md text-white bg-gradient-to-r from-primary to-secondary-container px-4 py-1.5 rounded-full mb-3 shadow-sm">
            Bienvenue sur Objely !
          </span>
          <h2 className="font-headline-lg text-headline-lg text-on-background leading-tight mb-2">
            Ton objet peut tout <span className="bg-gradient-to-r from-primary to-secondary-container bg-clip-text text-transparent">changer !</span>
          </h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-md">
            Perds un objet. Retrouve-le.
            <br />
            Ou aide les autres !
          </p>

          <div className="relative w-full flex justify-center">
            <div className="absolute -top-1 left-2 font-label-md text-[13px] text-primary -rotate-3">
              Des objets vraiment partout !
            </div>
            <Image
              src="/illustrations/home/composition.png"
              alt="Téléphone, écouteurs, montre, sac, casquette, clés et lunettes"
              width={405}
              height={287}
              priority
              className="w-[78%] h-auto drop-shadow-xl mt-6"
            />
          </div>
        </section>

        {/* Primary Action Cards */}
        <section className="flex flex-col gap-md mb-lg">
          <Link
            href="/report-lost"
            className="bg-gradient-to-r from-primary to-primary-container text-white rounded-[28px] px-lg py-md flex items-center gap-4 shadow-lg transition-transform active:scale-[0.98]"
          >
            <span className="w-12 h-12 rounded-full bg-white flex items-center justify-center shrink-0 overflow-hidden">
              <Image src="/illustrations/home/mascot.png" alt="" width={40} height={40} className="object-contain" />
            </span>
            <div className="flex-1">
              <h3 className="font-headline-sm text-headline-sm">Découvrir un objet perdu</h3>
              <p className="font-body-md text-[13px] text-white/80">Aidez à le retrouver</p>
            </div>
            <span className="w-8 h-8 rounded-full bg-white text-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </span>
          </Link>

          <Link
            href="/report-found"
            className="bg-gradient-to-r from-secondary-container to-secondary text-white rounded-[28px] px-lg py-md flex items-center gap-4 shadow-lg transition-transform active:scale-[0.98]"
          >
            <span className="w-12 h-12 rounded-full bg-white flex items-center justify-center shrink-0 text-secondary">
              <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>diamond</span>
            </span>
            <div className="flex-1">
              <h3 className="font-headline-sm text-headline-sm">Déclarer un objet trouvé</h3>
              <p className="font-body-md text-[13px] text-white/80">Rends-le à son propriétaire</p>
            </div>
            <span className="w-8 h-8 rounded-full bg-white text-secondary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </span>
          </Link>
        </section>

        {/* Community */}
        <section className="relative bg-surface-container-lowest/80 rounded-[28px] shadow-sm overflow-hidden mb-lg">
          <div className="flex items-stretch">
            <div className="flex-1 p-lg">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>groups</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">Une communauté solidaire</h3>
              <p className="font-body-md text-[13px] text-on-surface-variant mb-3">Des milliers de personnes déjà actives près de chez toi.</p>
              <Link href="/profile" className="inline-flex items-center gap-1 bg-white text-primary font-headline-sm text-[14px] px-4 py-2 rounded-full shadow-sm">
                Rejoindre
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>
            <div className="relative w-[42%] shrink-0">
              <Image src="/illustrations/home/couple.png" alt="Deux utilisateurs Objely qui consultent l'app ensemble" fill sizes="200px" className="object-cover" />
            </div>
          </div>
        </section>

        {/* Recent Finds — real data, unchanged behavior (not links to a specific item) */}
        <section className="space-y-md mb-lg">
          <div className="flex items-center justify-between">
            <h3 className="font-headline-sm text-headline-sm text-on-background">Objets récemment trouvés</h3>
            <Link href="/search" className="font-label-md text-label-md text-primary flex items-center gap-0.5">
              Voir tout
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </Link>
          </div>
          {recentFinds && recentFinds.length > 0 ? (
            <div className="grid grid-cols-2 gap-md">
              {recentFinds.map((item, index) => (
                <div key={item.id} className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden">
                  <div className="relative h-28 bg-surface-container-high flex items-center justify-center text-primary">
                    {item.photos?.[0] ? (
                      <Image alt={item.title} src={item.photos[0]} fill sizes="200px" className="object-cover" priority={index === 0} />
                    ) : (
                      <span className="material-symbols-outlined text-4xl">{item.category_icon || "inventory_2"}</span>
                    )}
                    <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center shadow-sm">
                      <span className="material-symbols-outlined text-[13px]">check</span>
                    </span>
                  </div>
                  <div className="p-2.5">
                    <span className="inline-block font-label-md text-[10px] text-white bg-primary/90 px-2 py-0.5 rounded-md mb-1.5">
                      {item.category_label}
                    </span>
                    <div className="flex items-center gap-1 text-on-surface-variant mb-0.5">
                      <span className="material-symbols-outlined text-[13px]">location_on</span>
                      <span className="font-body-md text-[12px] truncate">{item.location || "Lieu non précisé"}</span>
                    </div>
                    <p className="font-label-md text-[11px] text-outline">{timeAgo(item.created_at)}</p>
                  </div>
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

        {/* Bottom banner */}
        <section className="relative bg-surface-container-lowest/80 rounded-[28px] shadow-sm px-lg py-md flex items-center gap-3 mb-lg overflow-visible">
          <p className="font-label-md text-[12px] text-primary -rotate-2 max-w-[90px] shrink-0">
            Un petit objet peut faire une grande différence !
          </p>
          <Image src="/illustrations/home/mascot.png" alt="" width={56} height={56} className="shrink-0 drop-shadow-md" />
          <Link
            href="/search"
            className="flex-1 bg-gradient-to-r from-primary to-secondary-container text-white rounded-full px-4 py-3 flex items-center gap-2 shadow-sm"
          >
            <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[15px]">location_on</span>
            </span>
            <span className="flex-1 min-w-0">
              <span className="block font-label-md text-[12px] font-semibold">T&apos;es du coin ?</span>
              <span className="block font-body-md text-[11px] text-white/80 truncate">Découvre les objets près de chez toi !</span>
            </span>
            <span className="material-symbols-outlined text-[16px] shrink-0">chevron_right</span>
          </Link>
        </section>
      </main>

      {user && <MessagesFab unreadCount={unreadMessageCount ?? 0} />}

      <BottomNav active="home" />
    </div>
  );
}
