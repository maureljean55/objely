"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import MyItemCard from "@/components/MyItemCard";
import type { Item } from "@/lib/supabase/items";

// category ids match the CATEGORIES list in report-lost/report-found —
// "Autres" catches anything declared under a category not named here.
const CATEGORY_FILTERS: { label: string; value: string | null }[] = [
  { label: "Tous", value: null },
  { label: "Téléphones", value: "phone" },
  { label: "Sacs", value: "bag" },
  { label: "Clés", value: "keys" },
  { label: "Portefeuilles", value: "wallet" },
  { label: "Ordinateurs", value: "computer" },
  { label: "Autres", value: "other" },
];

const TYPE_OPTIONS: { label: string; value: string | null }[] = [
  { label: "Tous types", value: null },
  { label: "Objets perdus", value: "lost" },
  { label: "Objets trouvés", value: "found" },
];

const STATUS_OPTIONS: { label: string; value: string | null }[] = [
  { label: "Tous les statuts", value: null },
  { label: "Recherche active", value: "searching" },
  { label: "Correspondance trouvée", value: "matched" },
  { label: "Résolu", value: "resolved" },
];

function buildHref(params: { category: string | null; type: string | null; status: string | null }) {
  const sp = new URLSearchParams();
  if (params.category) sp.set("category", params.category);
  if (params.type) sp.set("type", params.type);
  if (params.status) sp.set("status", params.status);
  const qs = sp.toString();
  return qs ? `/search?${qs}` : "/search";
}

export default function MyItemsBrowser({
  items,
  matchByItemId,
  hasAnyItems,
  filtersActive,
  category,
  type,
  status,
  initialQuery = "",
}: {
  items: Item[];
  matchByItemId: Record<string, { id: string; percent: number }>;
  hasAnyItems: boolean;
  filtersActive: boolean;
  category: string | null;
  type: string | null;
  status: string | null;
  initialQuery?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const visibleItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) =>
      [item.title, item.brand, item.category_label].some((field) => field?.toLowerCase().includes(q)),
    );
  }, [items, query]);

  const activePanelFilters = (type ? 1 : 0) + (status ? 1 : 0);
  const anyFilterActive = filtersActive || query.trim().length > 0;

  return (
    <>
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
            <Link href="/help" aria-label="Aide" className="text-on-surface-variant hover:opacity-80 transition-opacity active:scale-95 flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">info</span>
            </Link>
          </div>

          <div className="flex flex-row gap-sm items-center w-full mt-md relative">
            <div className="relative flex-1 min-w-0">
              <span className="material-symbols-outlined absolute left-lg top-1/2 -translate-y-1/2 text-outline">search</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-surface-container-lowest text-on-surface placeholder:text-outline rounded-full border-none focus:outline-none focus:ring-2 focus:ring-primary/30 pl-[48px] pr-sm h-[56px] font-body-md transition-all shadow-sm"
                placeholder="Rechercher parmi mes objets"
                type="text"
              />
            </div>
            <button
              type="button"
              onClick={() => setFiltersOpen((v) => !v)}
              aria-label="Filtres"
              aria-expanded={filtersOpen}
              className="relative shrink-0 flex items-center justify-center gap-2 bg-primary/10 text-primary rounded-full px-md h-[56px] font-headline-sm hover:bg-primary/15 transition-colors whitespace-nowrap"
            >
              <span className="material-symbols-outlined">tune</span>
              <span className="hidden sm:inline">Filtres</span>
              {activePanelFilters > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-white text-[11px] flex items-center justify-center">
                  {activePanelFilters}
                </span>
              )}
            </button>

            {filtersOpen && (
              <div className="absolute right-0 top-[64px] z-20 w-72 max-w-[85vw] bg-surface-container-lowest rounded-[20px] soft-shadow border border-outline-variant/30 p-md flex flex-col gap-md">
                <div>
                  <p className="font-label-md text-[11px] text-outline uppercase tracking-wider mb-2">Type</p>
                  <div className="flex flex-wrap gap-2">
                    {TYPE_OPTIONS.map((opt) => (
                      <Link
                        key={opt.label}
                        href={buildHref({ category, type: opt.value, status })}
                        onClick={() => setFiltersOpen(false)}
                        className={`px-3 py-1.5 rounded-full font-label-md text-[13px] transition-colors ${
                          (type ?? null) === opt.value
                            ? "bg-primary text-on-primary"
                            : "bg-surface-container-low text-on-surface-variant border border-outline-variant/40 hover:bg-surface-variant"
                        }`}
                      >
                        {opt.label}
                      </Link>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="font-label-md text-[11px] text-outline uppercase tracking-wider mb-2">Statut</p>
                  <div className="flex flex-wrap gap-2">
                    {STATUS_OPTIONS.map((opt) => (
                      <Link
                        key={opt.label}
                        href={buildHref({ category, type, status: opt.value })}
                        onClick={() => setFiltersOpen(false)}
                        className={`px-3 py-1.5 rounded-full font-label-md text-[13px] transition-colors ${
                          (status ?? null) === opt.value
                            ? "bg-primary text-on-primary"
                            : "bg-surface-container-low text-on-surface-variant border border-outline-variant/40 hover:bg-surface-variant"
                        }`}
                      >
                        {opt.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-sm overflow-x-auto hide-scrollbar mt-sm py-xs w-full">
            {CATEGORY_FILTERS.map((filter) => {
              const isActive = (category ?? null) === filter.value;
              return (
                <Link
                  key={filter.label}
                  href={buildHref({ category: filter.value, type, status })}
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
        {visibleItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-xl text-center">
            <div
              className="w-28 h-28 mb-lg rounded-full flex items-center justify-center shadow-lg"
              style={{ background: "linear-gradient(135deg, #0058bc, #5952af)" }}
            >
              <span className="material-symbols-outlined text-white text-[48px]">search_off</span>
            </div>
            {hasAnyItems ? (
              <>
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-2">
                  {anyFilterActive ? "Aucun résultat" : "Aucun objet"}
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant mb-lg px-6 max-w-sm">
                  {query.trim()
                    ? "Essayez un autre terme de recherche."
                    : "Essayez un autre filtre, ou consultez tous vos objets."}
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
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-md mb-xl">
            {visibleItems.map((item) => (
              <MyItemCard key={item.id} item={item} match={matchByItemId[item.id]} />
            ))}
          </section>
        )}
      </main>
    </>
  );
}
