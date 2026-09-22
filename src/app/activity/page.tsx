import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import { createClient } from "@/lib/supabase/server";
import type { Item } from "@/lib/supabase/items";

export const metadata: Metadata = {
  title: "Activité",
  description: "Suivez vos correspondances, messages et restitutions d'objets sur Objely.",
};

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
  chat_closed_at: string | null;
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
  // Previously rendered a silently-empty activity list for a signed-out
  // visitor instead of sending them to log in — not a data leak (nothing
  // loads without a session), but inconsistent with what this page implies.
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/activity${filter === "all" ? "" : `?filter=${filter}`}`)}`);
  }

  const { data: allMatches } = await supabase
    .from("matches")
    .select(
      "id, match_percent, status, chat_closed_at, created_at, lost_item:items!matches_lost_item_id_fkey(*), found_item:items!matches_found_item_id_fkey(*)",
    )
    .order("created_at", { ascending: false })
    .returns<MatchRow[]>();

  // The embed above resolves through matches_*_item_id_fkey, which targets
  // the base `items` table directly — PostgREST can't route a foreign-key
  // embed through a view, so it can't apply items_public's redaction (exact
  // location only for the owner or a confirmed counterpart) on its own (see
  // the same limitation called out in getMatch, src/lib/supabase/messages.ts).
  // Patch the (now correctly-redacted) location back in from a second query.
  const itemIds = Array.from(new Set((allMatches ?? []).flatMap((m) => [m.lost_item.id, m.found_item.id])));
  const { data: locatedItems } = itemIds.length
    ? await supabase.from("items_public").select("id, location").in("id", itemIds)
    : { data: [] as { id: string; location: string | null }[] };
  const locationByItemId = new Map((locatedItems ?? []).map((i) => [i.id, i.location]));
  for (const match of allMatches ?? []) {
    match.lost_item.location = locationByItemId.get(match.lost_item.id) ?? null;
    match.found_item.location = locationByItemId.get(match.found_item.id) ?? null;
  }

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

  const FILTER_COUNTS: Record<FilterId, number> = {
    all: matches.length,
    matches: matches.filter((m) => m.status !== "confirmed").length,
    messages: matches.filter((m) => m.status === "confirmed").length,
    restitutions: verificationRequests.length,
  };

  return (
    <div className="bg-background text-on-background font-body-md antialiased min-h-screen pb-28 md:pb-12">
      <header className="glass-header fixed top-0 inset-x-0 z-50 flex items-center justify-between px-container-margin min-h-16 pt-[env(safe-area-inset-top)] w-full shadow-[0_1px_0_rgba(0,0,0,0.05)]">
        <div className="w-10 h-10" />
        <h1 className="font-headline-sm text-headline-sm text-on-surface">Activité</h1>
        <div className="w-10 h-10" />
      </header>

      <main className="pt-[calc(88px+env(safe-area-inset-top))] max-w-2xl mx-auto">
        <div className="px-container-margin pb-md flex gap-sm overflow-x-auto hide-scrollbar">
          {FILTERS.map((f) => {
            const isActive = f.id === filter;
            const count = FILTER_COUNTS[f.id];
            return (
              <Link
                key={f.id}
                href={f.id === "all" ? "/activity" : `/activity?filter=${f.id}`}
                className={
                  isActive
                    ? "shrink-0 whitespace-nowrap px-4 py-2 rounded-full text-white font-headline-sm text-headline-sm shadow-sm flex items-center gap-1.5"
                    : "shrink-0 whitespace-nowrap px-4 py-2 rounded-full bg-surface-container-lowest text-on-surface-variant border border-outline-variant/50 font-headline-sm text-headline-sm hover:bg-surface-variant transition-colors flex items-center gap-1.5"
                }
                style={isActive ? { background: "linear-gradient(135deg, #0058bc, #5952af)" } : undefined}
              >
                {f.label}
                {count > 0 && (
                  <span
                    className={
                      isActive
                        ? "min-w-[18px] h-[18px] px-1 rounded-full bg-white/25 text-white font-label-md text-[11px] flex items-center justify-center"
                        : "min-w-[18px] h-[18px] px-1 rounded-full bg-surface-container text-on-surface-variant font-label-md text-[11px] flex items-center justify-center"
                    }
                  >
                    {count}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        <div className="px-container-margin flex flex-col gap-lg">
          {visibleMatches.map((match) => {
            const isLostSide = match.lost_item.user_id === user!.id;
            const otherItem = isLostSide ? match.found_item : match.lost_item;
            const isHighMatch = match.match_percent >= 85;
            return (
              <article key={match.id} className="bg-surface-container-lowest rounded-3xl soft-shadow inner-stroke overflow-hidden">
                <div className="p-md pb-sm flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        isHighMatch ? "bg-secondary-fixed text-secondary" : "bg-primary-fixed text-primary"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        {isHighMatch ? "auto_awesome" : "sync"}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <span className="font-label-md text-label-md text-on-surface">Nouvelle correspondance</span>
                      <span className="font-label-md text-[12px] text-outline ml-1">• {timeAgo(match.created_at)}</span>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-label-md text-[12px] font-bold shrink-0 ${
                      isHighMatch ? "bg-secondary/10 text-secondary" : "bg-primary/10 text-primary"
                    }`}
                  >
                    {isHighMatch && <span className="material-symbols-outlined text-[14px]">bolt</span>}
                    {match.match_percent}% Match
                  </span>
                </div>
                <div className="mx-md mb-md p-sm bg-surface-container-low/60 rounded-2xl flex gap-3 items-center">
                  <div className="relative w-16 h-16 rounded-xl shadow-sm bg-surface-container-high flex items-center justify-center text-primary shrink-0 overflow-hidden">
                    {otherItem.photos?.[0] ? (
                      <Image alt={otherItem.title} src={otherItem.photos[0]} fill sizes="64px" className="object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-3xl">{otherItem.category_icon || "inventory_2"}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-headline-sm text-headline-sm text-on-surface truncate">{otherItem.title}</p>
                    {otherItem.location ? (
                      <p className="font-label-md text-[12px] text-on-surface-variant truncate">{otherItem.location}</p>
                    ) : (
                      <p className="font-label-md text-[12px] text-on-surface-variant truncate">
                        {isLostSide ? "Objet trouvé correspondant" : "Objet perdu correspondant"}
                      </p>
                    )}
                  </div>
                </div>
                <div className="px-md pb-md flex gap-sm">
                  <Link
                    href={`/activity/match?match=${match.id}`}
                    className="flex-1 h-14 bg-surface-container-lowest border border-outline-variant text-on-surface rounded-xl font-headline-sm text-headline-sm hover:bg-surface-container-low transition-all flex items-center justify-center"
                  >
                    Détails
                  </Link>
                  {match.status === "confirmed" && match.chat_closed_at ? (
                    <div
                      aria-disabled="true"
                      className="flex-1 h-14 text-white rounded-xl font-headline-sm text-headline-sm flex items-center justify-center shadow-sm opacity-40 blur-[1px] pointer-events-none select-none"
                      style={{ background: "linear-gradient(135deg, #0058bc, #5952af)" }}
                    >
                      Discuter
                    </div>
                  ) : match.status === "confirmed" ? (
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
            <div className="bg-surface-container-lowest rounded-3xl soft-shadow inner-stroke p-xl flex flex-col items-center text-center">
              <div className="w-16 h-16 mb-md rounded-3xl bg-secondary-fixed flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-[32px]">check_circle</span>
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
              <article key={`verif-${match.id}`} className="bg-surface-container-lowest rounded-3xl soft-shadow inner-stroke p-md">
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
