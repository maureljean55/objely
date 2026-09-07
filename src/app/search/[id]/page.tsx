import Link from "next/link";
import { notFound } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import { createClient } from "@/lib/supabase/server";
import { getServerTranslations } from "@/lib/i18n/server";
import type { TranslationDict } from "@/lib/i18n/translations";
import type { Item } from "@/lib/supabase/items";

function declaredDateLabel(item: Item, t: TranslationDict) {
  const verb = item.type === "lost" ? t.myItemCard.lostVerb : t.myItemCard.foundVerb;
  if (!item.occurred_on) return verb;
  return `${verb} ${new Date(item.occurred_on).toLocaleDateString(t.common.locale)}`;
}

export default async function MyItemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const t = await getServerTranslations();
  const { data: item } = await supabase.from("items").select("*").eq("id", id).single<Item>();
  if (!item) notFound();

  return (
    <div className="bg-background text-on-surface antialiased min-h-screen pb-24 md:pb-12">
      <header className="fixed top-0 inset-x-0 z-50 bg-surface/90 backdrop-blur-md shadow-sm">
        <div
          className="max-w-[720px] mx-auto flex items-center justify-between px-container-margin pb-sm"
          style={{ paddingTop: "calc(0.75rem + env(safe-area-inset-top))" }}
        >
          <Link href="/search" aria-label={t.itemDetail.back} className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:opacity-80 transition-opacity active:scale-95">
            <span className="material-symbols-outlined text-[24px]">arrow_back</span>
          </Link>
          <h1 className="font-display text-headline-sm font-bold text-on-surface text-center flex-1 truncate px-2">{item.title}</h1>
          <div className="w-10 h-10" />
        </div>
      </header>

      <main className="max-w-[720px] mx-auto px-container-margin pt-[calc(88px+env(safe-area-inset-top))]">
        <div className="relative h-56 w-full rounded-2xl overflow-hidden bg-surface-container-high mb-lg flex items-center justify-center text-primary">
          {item.photos?.[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img alt={item.title} className="w-full h-full object-cover" src={item.photos[0]} />
          ) : (
            <span className="material-symbols-outlined text-6xl">{item.category_icon || "inventory_2"}</span>
          )}
        </div>

        <div className="flex items-center justify-between mb-md">
          <div>
            <p className="font-label-md text-[11px] text-outline uppercase tracking-wider">{item.category_label}</p>
            <p className="font-body-md text-body-md text-on-surface-variant">
              {declaredDateLabel(item, t)} · {item.location || t.myItemCard.noLocation}
            </p>
          </div>
        </div>

        {item.description && (
          <section className="bg-surface-container-lowest rounded-2xl soft-shadow p-lg mb-lg">
            <p className="font-body-md text-body-md text-on-surface-variant">{item.description}</p>
          </section>
        )}

        {item.status === "searching" || item.status === "matched" ? (
          <section className="bg-surface-container-lowest rounded-2xl soft-shadow p-lg flex flex-col items-center text-center gap-2">
            <div className="w-14 h-14 rounded-full bg-error-container text-on-error-container flex items-center justify-center mb-1">
              <span className="material-symbols-outlined">radar</span>
            </div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface">
              {item.status === "matched" ? t.itemDetail.matchFound : t.itemDetail.stillSearching}
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-sm">
              {item.status === "matched" ? t.itemDetail.matchFoundBody : t.itemDetail.stillSearchingBody}
            </p>
          </section>
        ) : (
          <section className="bg-surface-container-lowest rounded-2xl soft-shadow overflow-hidden">
            <div className="p-lg flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#e8f5e9] text-[#2e7d32] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined">check_circle</span>
              </div>
              <div>
                <p className="font-label-md text-[11px] text-outline uppercase tracking-wider">{t.itemDetail.status}</p>
                <p className="font-headline-sm text-headline-sm text-on-surface">
                  {item.status === "recovered" ? t.itemDetail.itemRecovered : t.itemDetail.itemReturned}
                </p>
              </div>
            </div>
          </section>
        )}
      </main>

      <BottomNav active="search" />
    </div>
  );
}
