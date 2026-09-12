import Link from "next/link";
import Image from "next/image";
import BottomNav from "@/components/BottomNav";
import { createClient } from "@/lib/supabase/server";
import type { Item } from "@/lib/supabase/items";

type FilterId = "all" | "matches" | "messages" | "restitutions";
const FILTERS: { label: string; id: FilterId }[] = [
  { label: "Tout", id: "all" },
  { label: "Correspondances", id: "matches" },
  { label: "Messages", id: "messages" },
  { label: "Restitutions", id: "restitutions" },
];

type MatchRow = {
  id: string;
  match_percent: number;
  status: "pending" | "confirmed" | "rejected";
  created_at: string;
  lost_item: Item;
  found_item: Item;
};

function timeAgo(dateStr: string) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "à l'instant";
  if (mins < 60) return `il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `il y a ${hours} h`;
  return `il y a ${Math.floor(hours / 24)} j`;
}

export default async function ActivityPage({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
  const { filter: filterParam } = await searchParams;
  const filter: FilterId = FILTERS.some((f) => f.id === filterParam) ? (filterParam as FilterId) : "all";
  const supabase = await createClient();
  // Middleware already validated/refreshed the session for this request, so
  // reading it back here doesn't need a second round trip to Supabase's
  // Auth server.
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user ?? null;

  const { data: allMatches } = user
    ? await supabase
        .from("matches")
        .select("id, match_percent, status, created_at, lost_item:items!matches_lost_item_id_fkey(*), found_item:items!matches_found_item_id_fkey(*)")
        .order("created_at", { ascending: false })
        .returns<MatchRow[]>()
    : { data: [] as MatchRow[] };

  // Hide matches referencing an item either side has since soft-deleted —
  // the declaration no longer exists to its owner, so it shouldn't keep
  // showing up as an active match to the other party.
  const matches = (allMatches ?? []).filter((match) => !match.lost_item.deleted_at && !match.found_item.deleted_at);

  // "Messages" means the match has an open conversation (confirmed);
  // "Correspondances" is everything else (pending/rejected); "Restitutions"
  // hides match cards entirely in favor of the verification requests below.
  const visibleMatches = matches.filter((match) => {
    if (filter === "all") return true;
    if (filter === "matches") return match.status !== "confirmed";
    if (filter === "messages") return match.status === "confirmed";
    return false;
  });
  const showVerifications = filter === "all" || filter === "restitutions";
  const verificationRequests = matches.filter((match) => match.status === "pending" && match.found_item.user_id === user!.id);
  const nothingForFilter = visibleMatches.length === 0 && (!showVerifications || verificationRequests.length === 0);

  return (
    <div className="bg-background text-on-background font-body-md antialiased min-h-screen pb-28 md:pb-12">
      <header className="glass-header fixed top-0 inset-x-0 z-50 flex items-center px-container-margin min-h-16 pt-[env(safe-area-inset-top)] w-full shadow-[0_1px_0_rgba(0,0,0,0.05)]">
        <h1 className="font-display text-headline-lg-mobile text-headline-lg-mobile font-extrabold tracking-tight text-on-surface">Activité</h1>
      </header>

      <main className="pt-[calc(88px+env(safe-area-inset-top))] max-w-2xl mx-auto">
        <div className="px-container-margin pb-md flex gap-sm overflow-x-auto hide-scrollbar">
          {FILTERS.map((f) => {
            const isActive = f.id === filter;
            return (
              <Link
                key={f.id}
                href={f.id === "all" ? "/activity" : `/activity?filter=${f.id}`}
                className={
                  isActive
                    ? "shrink-0 whitespace-nowrap px-4 py-2 rounded-full text-white font-headline-sm text-headline-sm shadow-sm"
                    : "shrink-0 whitespace-nowrap px-4 py-2 rounded-full bg-surface-container-lowest text-on-surface-variant border border-outline-variant/50 font-headline-sm text-headline-sm hover:bg-surface-variant transition-colors"
                }
                style={isActive ? { background: "linear-gradient(135deg, #0058bc, #5952af)" } : undefined}
              >
                {f.label}
              </Link>
            );
          })}
        </div>

        <div className="px-container-margin flex flex-col gap-lg">
          {visibleMatches.map((match) => {
            const isLostSide = match.lost_item.user_id === user!.id;
            const otherItem = isLostSide ? match.found_item : match.lost_item;
            return (
              <article key={match.id} className="bg-surface-container-lowest rounded-[24px] soft-shadow inner-stroke overflow-hidden">
                <div className="p-md border-b border-surface-variant/60 flex gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-white shadow-sm"
                    style={{ background: "linear-gradient(135deg, #0058bc, #5952af)" }}
                  >
                    <span className="material-symbols-outlined">my_location</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <h2 className="font-headline-sm text-headline-sm text-on-surface">Nouvelle correspondance</h2>
                      <span className="font-label-md text-label-md text-on-surface-variant shrink-0">{timeAgo(match.created_at)}</span>
                    </div>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                      Une correspondance possible a été trouvée pour votre {isLostSide ? "objet perdu" : "objet trouvé"}.
                    </p>
                  </div>
                </div>
                <div className="p-md bg-surface-container-low flex gap-4 items-center">
                  <div className="relative w-16 h-16 rounded-xl shadow-sm bg-surface-container-high flex items-center justify-center text-primary shrink-0 overflow-hidden">
                    {otherItem.photos?.[0] ? (
                      <Image alt={otherItem.title} src={otherItem.photos[0]} fill sizes="64px" className="object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-3xl">{otherItem.category_icon || "inventory_2"}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-headline-sm text-headline-sm text-on-surface">{otherItem.title}</p>
                    <div className="flex items-center gap-1 mt-1 text-tertiary">
                      <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      <span className="font-label-md text-label-md">{match.match_percent}% de correspondance</span>
                    </div>
                  </div>
                </div>
                <div className="p-md flex gap-sm">
                  <Link
                    href={`/activity/match?match=${match.id}`}
                    className="flex-1 h-14 bg-surface-container-lowest border border-outline-variant text-on-surface rounded-xl font-headline-sm text-headline-sm hover:bg-surface-container-low transition-all flex items-center justify-center"
                  >
                    Détails
                  </Link>
                  {match.status === "confirmed" ? (
                    <Link
                      href={`/chat/${match.id}`}
                      className="flex-1 h-14 text-white rounded-xl font-headline-sm text-headline-sm hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center shadow-sm"
                      style={{ background: "linear-gradient(135deg, #0058bc, #5952af)" }}
                    >
                      Discuter
                    </Link>
                  ) : match.status === "rejected" ? (
                    <div className="flex-1 h-14 bg-surface-container text-on-surface-variant rounded-xl font-label-md text-label-md flex items-center justify-center text-center px-2">
                      Correspondance refusée
                    </div>
                  ) : (
                    <div className="flex-1 h-14 bg-surface-container text-on-surface-variant rounded-xl font-label-md text-label-md flex items-center justify-center text-center px-2">
                      En attente de vérification
                    </div>
                  )}
                </div>
              </article>
            );
          })}

          {nothingForFilter && (
            <div className="bg-surface-container-lowest rounded-[24px] soft-shadow inner-stroke p-xl flex flex-col items-center text-center">
              <div
                className="w-20 h-20 mb-md rounded-full flex items-center justify-center shadow-lg"
                style={{ background: "linear-gradient(135deg, #0058bc, #5952af)" }}
              >
                <span className="material-symbols-outlined text-white text-[36px]">notifications_active</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-1">
                {filter === "all" ? "Aucune correspondance pour le moment" : "Rien à afficher pour ce filtre"}
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant">
                {filter === "all"
                  ? "Vous serez averti dès qu'une déclaration correspond à un de vos objets."
                  : "Essayez un autre filtre pour voir votre activité."}
              </p>
            </div>
          )}

          {showVerifications &&
            verificationRequests.map((match) => (
              <article key={`verif-${match.id}`} className="bg-surface-container-lowest rounded-[24px] soft-shadow inner-stroke p-md">
                <div className="flex gap-3 mb-md">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-white shadow-sm"
                    style={{ background: "linear-gradient(135deg, #f97316, #ef4444)" }}
                  >
                    <span className="material-symbols-outlined">lock_open</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <h2 className="font-headline-sm text-headline-sm text-on-surface">Vérification de propriété</h2>
                      <span className="font-label-md text-label-md text-on-surface-variant shrink-0">{timeAgo(match.created_at)}</span>
                    </div>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                      Une vérification est nécessaire avant la restitution de {match.found_item.title}.
                    </p>
                  </div>
                </div>
                <Link
                  href={`/activity/verification?match=${match.id}`}
                  className="w-full h-14 text-white rounded-xl font-headline-sm text-headline-sm hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center shadow-sm"
                  style={{ background: "linear-gradient(135deg, #f97316, #ef4444)" }}
                >
                  Voir la demande
                </Link>
              </article>
            ))}
        </div>
      </main>

      <BottomNav active="activity" />
    </div>
  );
}
