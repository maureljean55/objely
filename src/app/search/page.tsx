import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import MyItemCard from "@/components/MyItemCard";
import { createClient } from "@/lib/supabase/server";
import type { Item } from "@/lib/supabase/items";

// category ids match the CATEGORIES list in report-lost/report-found —
// "Autres" catches anything declared under a category not named here.
const FILTERS: { label: string; categoryId: string | null }[] = [
  { label: "Tous", categoryId: null },
  { label: "Téléphones", categoryId: "phone" },
  { label: "Sacs", categoryId: "bag" },
  { label: "Clés", categoryId: "keys" },
  { label: "Portefeuilles", categoryId: "wallet" },
  { label: "Ordinateurs", categoryId: "computer" },
  { label: "Autres", categoryId: "other" },
];
const NAMED_CATEGORY_IDS = new Set(["phone", "bag", "keys", "wallet", "computer"]);

export default async function SearchFiltersPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const supabase = await createClient();
  // Middleware already validated/refreshed the session for this request, so
  // reading it back here doesn't need a second round trip to Supabase's
  // Auth server.
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user ?? null;

  const { data: myItems } = user
    ? await supabase
        .from("items")
        .select("*")
        .eq("user_id", user.id)
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .returns<Item[]>()
    : { data: [] as Item[] };

  const items = (myItems ?? []).filter((item) => {
    if (!category) return true;
    if (category === "other") return !NAMED_CATEGORY_IDS.has(item.category_id);
    return item.category_id === category;
  });

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen pb-24 md:pb-0 pt-[calc(176px+env(safe-area-inset-top))] md:pt-[calc(132px+env(safe-area-inset-top))]">
      <header className="fixed top-0 inset-x-0 z-50 bg-surface/90 backdrop-blur-md shadow-sm">
        <div
          className="max-w-[1140px] mx-auto px-container-margin pb-sm"
          style={{ paddingTop: "calc(0.75rem + env(safe-area-inset-top))" }}
        >
          <div className="flex items-center justify-between">
            <Link href="/home" className="text-on-surface-variant hover:opacity-80 transition-opacity active:scale-95 hidden md:flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">arrow_back</span>
            </Link>
            <h1 className="font-display text-headline-sm font-extrabold tracking-tight text-on-surface text-center flex-1">Mes objets</h1>
            <button className="text-on-surface-variant hover:opacity-80 transition-opacity active:scale-95 flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">info</span>
            </button>
          </div>

          <div className="flex flex-row gap-sm items-center w-full mt-md">
            <div className="relative flex-1 min-w-0">
              <span className="material-symbols-outlined absolute left-lg top-1/2 -translate-y-1/2 text-outline">search</span>
              <input
                className="w-full bg-surface-container-lowest text-on-surface placeholder:text-outline rounded-full border-none focus:outline-none focus:ring-2 focus:ring-primary/30 pl-[48px] pr-sm h-[56px] font-body-md transition-all shadow-sm"
                placeholder="Rechercher parmi mes objets"
                type="text"
              />
            </div>
            <button className="shrink-0 flex items-center justify-center gap-2 bg-primary/10 text-primary rounded-full px-md h-[56px] font-headline-sm hover:bg-primary/15 transition-colors whitespace-nowrap">
              <span className="material-symbols-outlined">tune</span>
              <span className="hidden sm:inline">Filtres</span>
            </button>
          </div>

          <div className="flex gap-sm overflow-x-auto hide-scrollbar mt-sm py-xs w-full">
            {FILTERS.map((filter) => {
              const isActive = (category ?? null) === filter.categoryId;
              return (
                <Link
                  key={filter.label}
                  href={filter.categoryId ? `/search?category=${filter.categoryId}` : "/search"}
                  className={
                    isActive
                      ? "text-white rounded-full px-4 py-2 font-label-md whitespace-nowrap shadow-sm"
                      : "bg-surface-container-lowest text-on-surface-variant rounded-full px-4 py-2 font-label-md whitespace-nowrap border border-outline-variant/50 hover:bg-surface-variant transition-colors"
                  }
                  style={isActive ? { background: "linear-gradient(135deg, #0058bc, #5952af)" } : undefined}
                >
                  {filter.label}
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      <main className="max-w-[1140px] mx-auto px-container-margin pt-lg">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-xl text-center">
            <div
              className="w-28 h-28 mb-lg rounded-full flex items-center justify-center shadow-lg"
              style={{ background: "linear-gradient(135deg, #0058bc, #5952af)" }}
            >
              <span className="material-symbols-outlined text-white text-[48px]">search_off</span>
            </div>
            {category ? (
              <>
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-2">Aucun objet dans cette catégorie</h3>
                <p className="font-body-md text-body-md text-on-surface-variant mb-lg px-6 max-w-sm">
                  Essayez un autre filtre, ou consultez tous vos objets.
                </p>
                <Link
                  href="/search"
                  className="px-8 py-3 rounded-full text-white font-body-lg text-body-lg font-bold shadow-md hover:opacity-90 transition-opacity"
                  style={{ background: "linear-gradient(135deg, #0058bc, #5952af)" }}
                >
                  Voir tous mes objets
                </Link>
              </>
            ) : (
              <>
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-2">Vous n&apos;avez déclaré aucun objet</h3>
                <p className="font-body-md text-body-md text-on-surface-variant mb-lg px-6 max-w-sm">
                  Déclarez un objet perdu ou trouvé depuis l&apos;accueil pour le suivre ici.
                </p>
                <Link
                  href="/home"
                  className="px-8 py-3 rounded-full text-white font-body-lg text-body-lg font-bold shadow-md hover:opacity-90 transition-opacity"
                  style={{ background: "linear-gradient(135deg, #0058bc, #5952af)" }}
                >
                  Aller à l&apos;accueil
                </Link>
              </>
            )}
          </div>
        ) : (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-md mb-xl">
            {items.map((item) => (
              <MyItemCard key={item.id} item={item} />
            ))}
          </section>
        )}
      </main>

      <BottomNav active="search" />
    </div>
  );
}
