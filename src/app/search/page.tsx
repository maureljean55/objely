import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { MY_ITEMS } from "@/lib/myItems";

const FILTERS = ["Tous", "Téléphones", "Sacs", "Clés", "Portefeuilles", "Ordinateurs", "Autres"];

const STATUS_BADGE = {
  searching: { label: "Recherche active", icon: "radar", className: "bg-error-container text-on-error-container" },
  recovered: { label: "Retrouvé", icon: "check_circle", className: "bg-[#e8f5e9] text-[#2e7d32]" },
  returned: { label: "Restitué", icon: "check_circle", className: "bg-[#e8f5e9] text-[#2e7d32]" },
} as const;

export default function SearchFiltersPage() {
  return (
    <div className="bg-background text-on-background font-body-md min-h-screen pb-24 md:pb-0 pt-[176px] md:pt-[132px]">
      <header className="fixed top-0 inset-x-0 z-50 bg-surface/90 backdrop-blur-md shadow-sm">
        <div className="max-w-[1140px] mx-auto px-container-margin py-sm">
          <div className="flex items-center justify-between">
            <Link href="/home" className="text-on-surface-variant hover:opacity-80 transition-opacity active:scale-95 hidden md:flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">arrow_back</span>
            </Link>
            <h1 className="font-display text-headline-sm font-bold text-on-surface text-center flex-1">Mes objets</h1>
            <button className="text-on-surface-variant hover:opacity-80 transition-opacity active:scale-95 flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">info</span>
            </button>
          </div>

          <div className="flex flex-row gap-sm items-center w-full mt-md">
            <div className="relative flex-1 min-w-0">
              <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-outline">search</span>
              <input
                className="w-full bg-surface text-on-surface placeholder:text-outline rounded border-none focus:ring-1 focus:ring-primary pl-[44px] pr-sm h-[56px] font-body-md transition-all shadow-sm"
                placeholder="Rechercher parmi mes objets"
                type="text"
              />
            </div>
            <button className="shrink-0 flex items-center justify-center gap-2 bg-surface text-primary border border-primary rounded px-md h-[56px] font-headline-sm hover:opacity-80 transition-opacity whitespace-nowrap shadow-sm">
              <span className="material-symbols-outlined">tune</span>
              <span className="hidden sm:inline">Filtres</span>
            </button>
          </div>

          <div className="flex gap-sm overflow-x-auto hide-scrollbar mt-sm py-xs w-full">
            {FILTERS.map((filter, i) => (
              <button
                key={filter}
                className={
                  i === 0
                    ? "bg-[#A29BFE]/15 text-[#A29BFE] rounded-full px-4 py-2 font-label-md whitespace-nowrap border border-transparent"
                    : "bg-surface text-on-surface-variant rounded-full px-4 py-2 font-label-md whitespace-nowrap border border-outline-variant hover:bg-surface-variant transition-colors"
                }
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-[1140px] mx-auto px-container-margin pt-lg">
        {MY_ITEMS.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-xl text-center">
            <div className="w-32 h-32 mb-lg bg-surface-container-low rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[56px]">search_off</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">Vous n&apos;avez déclaré aucun objet</h3>
            <p className="font-body-md text-body-md text-on-surface-variant mb-lg px-6 max-w-sm">
              Déclarez un objet perdu ou trouvé depuis l&apos;accueil pour le suivre ici.
            </p>
          </div>
        ) : (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-md mb-xl">
            {MY_ITEMS.map((item) => {
              const badge = STATUS_BADGE[item.status];
              return (
                <Link
                  key={item.id}
                  href={`/search/${item.id}`}
                  className="bg-surface rounded-lg shadow-soft-bloom overflow-hidden relative group border border-black/5 hover:scale-[1.02] transition-transform duration-300"
                >
                  <div className="h-48 w-full relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img alt={item.title} className="w-full h-full object-cover rounded-t-lg" src={item.image} />
                    <div
                      className={`absolute top-sm right-sm px-3 py-1 rounded-full font-label-md flex items-center gap-1 shadow-sm backdrop-blur-md bg-opacity-90 ${badge.className}`}
                    >
                      <span className="material-symbols-outlined text-[14px]">{badge.icon}</span>
                      {badge.label}
                    </div>
                  </div>
                  <div className="p-md flex flex-col gap-sm bg-surface">
                    <div className="flex justify-between items-start">
                      <h2 className="font-headline-sm text-on-surface font-semibold line-clamp-1">{item.title}</h2>
                      <span className="text-outline text-[12px] font-label-md whitespace-nowrap">
                        {item.type === "lost" ? "Perdu par moi" : "Trouvé par moi"}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1 text-on-surface-variant font-label-md">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                        <span>{item.declaredDateLabel}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px]">location_on</span>
                        <span>{item.location}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </section>
        )}
      </main>

      <BottomNav active="search" />
    </div>
  );
}
