import Link from "next/link";
import { notFound } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import { getMyItem } from "@/lib/myItems";

export default async function MyItemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = getMyItem(id);
  if (!item) notFound();

  return (
    <div className="bg-background text-on-surface antialiased min-h-screen pb-24 md:pb-12">
      <header className="fixed top-0 inset-x-0 z-50 bg-surface/90 backdrop-blur-md shadow-sm">
        <div
          className="max-w-[720px] mx-auto flex items-center justify-between px-container-margin pb-sm"
          style={{ paddingTop: "calc(0.75rem + env(safe-area-inset-top))" }}
        >
          <Link href="/search" aria-label="Retour" className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:opacity-80 transition-opacity active:scale-95">
            <span className="material-symbols-outlined text-[24px]">arrow_back</span>
          </Link>
          <h1 className="font-display text-headline-sm font-bold text-on-surface text-center flex-1 truncate px-2">{item.title}</h1>
          <div className="w-10 h-10" />
        </div>
      </header>

      <main className="max-w-[720px] mx-auto px-container-margin pt-[calc(88px+env(safe-area-inset-top))]">
        <div className="relative h-56 w-full rounded-2xl overflow-hidden bg-surface-container-high mb-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt={item.title} className="w-full h-full object-cover" src={item.image} />
        </div>

        <div className="flex items-center justify-between mb-md">
          <div>
            <p className="font-label-md text-[11px] text-outline uppercase tracking-wider">{item.category}</p>
            <p className="font-body-md text-body-md text-on-surface-variant">{item.declaredDateLabel} · {item.location}</p>
          </div>
        </div>

        {item.status === "searching" ? (
          <section className="bg-surface-container-lowest rounded-2xl soft-shadow p-lg flex flex-col items-center text-center gap-2">
            <div className="w-14 h-14 rounded-full bg-error-container text-on-error-container flex items-center justify-center mb-1">
              <span className="material-symbols-outlined">radar</span>
            </div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Recherche toujours active</h2>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-sm">
              Personne n&apos;a encore signalé cet objet. Vous serez averti dès qu&apos;une correspondance est trouvée.
            </p>
          </section>
        ) : (
          <section className="bg-surface-container-lowest rounded-2xl soft-shadow overflow-hidden">
            <div className="p-lg flex items-center gap-4 border-b border-surface-variant/50">
              <div className="w-14 h-14 rounded-full bg-[#e8f5e9] text-[#2e7d32] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined">{item.type === "lost" ? "volunteer_activism" : "person"}</span>
              </div>
              <div>
                <p className="font-label-md text-[11px] text-outline uppercase tracking-wider">
                  {item.type === "lost" ? "Trouvé par" : "Perdu par"}
                </p>
                <p className="font-headline-sm text-headline-sm text-on-surface">{item.match?.name}</p>
              </div>
            </div>
            <div className="p-lg flex flex-col gap-3 font-body-md text-body-md text-on-surface-variant">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                <span>{item.match?.dateLabel}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">schedule</span>
                <span>Récupéré en {item.match?.durationLabel}</span>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-surface-variant/50">
                <span className="material-symbols-outlined text-[18px]">info</span>
                <span>{item.details}</span>
              </div>
            </div>
          </section>
        )}
      </main>

      <BottomNav active="search" />
    </div>
  );
}
