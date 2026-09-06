import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { createClient } from "@/lib/supabase/server";
import type { Item } from "@/lib/supabase/items";

const FILTERS = ["Tout", "Correspondances", "Messages", "Restitutions"];

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

export default async function ActivityPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: matches } = user
    ? await supabase
        .from("matches")
        .select("id, match_percent, status, created_at, lost_item:items!matches_lost_item_id_fkey(*), found_item:items!matches_found_item_id_fkey(*)")
        .order("created_at", { ascending: false })
        .returns<MatchRow[]>()
    : { data: [] as MatchRow[] };

  return (
    <div className="bg-background text-on-background font-body-md antialiased min-h-screen pb-28 md:pb-12">
      <header className="glass-header fixed top-0 inset-x-0 z-50 flex items-center px-container-margin min-h-16 pt-[env(safe-area-inset-top)] w-full shadow-[0_1px_0_rgba(0,0,0,0.05)]">
        <h1 className="font-display text-headline-lg-mobile text-headline-lg-mobile text-on-surface">Activité</h1>
      </header>

      <main className="pt-[calc(88px+env(safe-area-inset-top))] max-w-2xl mx-auto">
        <div className="px-container-margin pb-md flex gap-sm overflow-x-auto hide-scrollbar">
          {FILTERS.map((filter, i) => (
            <button
              key={filter}
              className={
                i === 0
                  ? "shrink-0 whitespace-nowrap px-4 py-2 rounded-full bg-primary text-on-primary font-headline-sm text-headline-sm"
                  : "shrink-0 whitespace-nowrap px-4 py-2 rounded-full bg-surface-container-lowest text-on-surface-variant border border-outline-variant font-headline-sm text-headline-sm"
              }
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="px-container-margin flex flex-col gap-lg">
          {(matches ?? []).map((match) => {
            const isLostSide = match.lost_item.user_id === user!.id;
            const otherItem = isLostSide ? match.found_item : match.lost_item;
            return (
              <article key={match.id} className="bg-surface-container-lowest rounded-2xl soft-shadow inner-stroke overflow-hidden">
                <div className="p-md border-b border-surface-variant/60 flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-container/10 flex items-center justify-center shrink-0 text-primary-container">
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
                  <div className="w-16 h-16 rounded-xl shadow-sm bg-surface-container-high flex items-center justify-center text-primary shrink-0">
                    {otherItem.photos?.[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img alt={otherItem.title} className="w-full h-full object-cover rounded-xl" src={otherItem.photos[0]} />
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
                    href="/activity/match"
                    className="flex-1 h-14 bg-surface-container-lowest border border-outline-variant text-on-surface rounded-xl font-headline-sm text-headline-sm hover:bg-surface-container-low transition-all flex items-center justify-center"
                  >
                    Détails
                  </Link>
                  <Link
                    href={`/chat/${match.id}`}
                    className="flex-1 h-14 bg-primary text-on-primary rounded-xl font-headline-sm text-headline-sm hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center"
                  >
                    Discuter
                  </Link>
                </div>
              </article>
            );
          })}

          {(!matches || matches.length === 0) && (
            <div className="bg-surface-container-lowest rounded-2xl soft-shadow inner-stroke p-lg text-center">
              <p className="font-body-md text-body-md text-on-surface-variant">
                Aucune correspondance pour le moment. Vous serez averti dès qu&apos;une déclaration correspond à un de vos objets.
              </p>
            </div>
          )}

          {(matches ?? [])
            .filter((match) => match.status === "pending" && match.found_item.user_id === user!.id)
            .map((match) => (
              <article key={`verif-${match.id}`} className="bg-surface-container-lowest rounded-2xl soft-shadow inner-stroke p-md">
                <div className="flex gap-3 mb-md">
                  <div className="w-10 h-10 rounded-full bg-error-container/60 flex items-center justify-center shrink-0 text-error">
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
                  className="w-full h-14 bg-surface-container-lowest border-2 border-outline-variant text-on-surface rounded-xl font-headline-sm text-headline-sm hover:bg-surface-container-low transition-all flex items-center justify-center"
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
