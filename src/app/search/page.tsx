import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import MyItemCard from "@/components/MyItemCard";
import { createClient } from "@/lib/supabase/server";
import { getServerTranslations } from "@/lib/i18n/server";
import type { Item } from "@/lib/supabase/items";

const FILTERS = ["Tous", "Téléphones", "Sacs", "Clés", "Portefeuilles", "Ordinateurs", "Autres"];

export default async function SearchFiltersPage() {
  const supabase = await createClient();
  const t = await getServerTranslations();
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

  const items = myItems ?? [];

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
            <h1 className="font-display text-headline-sm font-bold text-on-surface text-center flex-1">{t.search.title}</h1>
            <button className="text-on-surface-variant hover:opacity-80 transition-opacity active:scale-95 flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">info</span>
            </button>
          </div>

          <div className="flex flex-row gap-sm items-center w-full mt-md">
            <div className="relative flex-1 min-w-0">
              <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-outline">search</span>
              <input
                className="w-full bg-surface text-on-surface placeholder:text-outline rounded border-none focus:ring-1 focus:ring-primary pl-[44px] pr-sm h-[56px] font-body-md transition-all shadow-sm"
                placeholder={t.search.searchPlaceholder}
                type="text"
              />
            </div>
            <button className="shrink-0 flex items-center justify-center gap-2 bg-surface text-primary border border-primary rounded px-md h-[56px] font-headline-sm hover:opacity-80 transition-opacity whitespace-nowrap shadow-sm">
              <span className="material-symbols-outlined">tune</span>
              <span className="hidden sm:inline">{t.search.filters}</span>
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
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-xl text-center">
            <div className="w-32 h-32 mb-lg bg-surface-container-low rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[56px]">search_off</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">{t.search.emptyTitle}</h3>
            <p className="font-body-md text-body-md text-on-surface-variant mb-lg px-6 max-w-sm">
              {t.search.emptySubtitle}
            </p>
          </div>
        ) : (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-md mb-xl">
            {items.map((item) => (
              <MyItemCard key={item.id} item={item} t={t} />
            ))}
          </section>
        )}
      </main>

      <BottomNav active="search" />
    </div>
  );
}
