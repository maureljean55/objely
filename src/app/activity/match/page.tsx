"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

const CRITERIA = [
  { label: "Même catégorie", matched: true },
  { label: "Couleur similaire", matched: true },
  { label: "Zone proche", matched: true },
  { label: "Description similaire", matched: false },
];

const IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAVZe46M5x8qXC3h2DOyPoXkYVWeSoWvUI435nRmzIEN1--7pMtaNWlk5Q1VgJPLx5-9u1tGeX6RXZVid3X_lCQXQXvJ4RONcKjQgHs1xyix2HmYk3xP2Q_6HqqILnEqmy7OYiTPFbfsmrEDqLL_A5nESIp-crOQwnTx7lX1jycLQKt2M4SCAdqpKh8mf_5vnYQeena3JPsC1iX82LLXIUKK838cpHi4nelFNdi4dimAk59ayExXFzs";

export default function MatchDetailPage() {
  const router = useRouter();

  return (
    <div className="bg-background text-on-background font-body-md antialiased min-h-screen pb-[160px]">
      <header className="glass-header fixed top-0 inset-x-0 z-50 flex items-center justify-between px-container-margin h-16 w-full shadow-[0_1px_0_rgba(0,0,0,0.05)]">
        <button type="button" onClick={() => router.back()} aria-label="Retour" className="w-10 h-10 flex items-center justify-center rounded-full text-primary hover:bg-surface-container-high/50 transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="font-headline-sm text-headline-sm text-on-surface flex-1 text-center">Correspondance</h1>
        <div className="w-10 h-10" />
      </header>

      <main className="pt-[88px] px-container-margin max-w-2xl mx-auto flex flex-col gap-lg">
        <section className="text-center">
          <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-1">
            🎉 Une correspondance possible !
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Nous avons trouvé un objet qui pourrait être le vôtre.
          </p>
        </section>

        <section className="relative">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="flex items-center justify-center w-16 h-16 bg-primary text-on-primary rounded-full shadow-md border-4 border-surface-container-lowest">
              <span className="font-headline-sm text-headline-sm">96%</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-gutter">
            <div className="bg-surface-container-lowest rounded-2xl soft-shadow overflow-hidden flex flex-col">
              <div className="px-3 py-2 bg-surface-container-low border-b border-surface-variant text-center">
                <span className="font-label-md text-label-md text-on-surface-variant uppercase">Mon objet perdu</span>
              </div>
              <div className="h-32 bg-surface-container-high">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img alt="Portefeuille marron perdu" className="w-full h-full object-cover" src={IMAGE} />
              </div>
              <div className="p-3 flex flex-col gap-1">
                <h3 className="font-headline-sm text-headline-sm text-on-surface line-clamp-1">Portefeuille marron</h3>
                <div className="flex items-center gap-1 text-on-surface-variant">
                  <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                  <span className="font-body-md text-body-md text-[13px] line-clamp-1">Perdu le 12 oct.</span>
                </div>
                <div className="flex items-center gap-1 text-on-surface-variant">
                  <span className="material-symbols-outlined text-[16px]">location_on</span>
                  <span className="font-body-md text-body-md text-[13px] line-clamp-1">Paris 10e</span>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-2xl soft-shadow overflow-hidden flex flex-col ring-2 ring-primary">
              <div className="px-3 py-2 bg-primary/10 border-b border-primary/20 text-center">
                <span className="font-label-md text-label-md text-primary uppercase">Objet trouvé</span>
              </div>
              <div className="h-32 bg-surface-container-high">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img alt="Portefeuille marron trouvé" className="w-full h-full object-cover" src={IMAGE} />
              </div>
              <div className="p-3 flex flex-col gap-1">
                <h3 className="font-headline-sm text-headline-sm text-on-surface line-clamp-1">Portefeuille marron</h3>
                <div className="flex items-center gap-1 text-primary">
                  <span className="material-symbols-outlined text-[16px]">schedule</span>
                  <span className="font-body-md text-body-md text-[13px] font-medium line-clamp-1">Trouvé aujourd&apos;hui</span>
                </div>
                <div className="flex items-center gap-1 text-on-surface-variant">
                  <span className="material-symbols-outlined text-[16px]">location_on</span>
                  <span className="font-body-md text-body-md text-[13px] line-clamp-1">Gare du Nord</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-surface-container-lowest rounded-2xl p-md soft-shadow">
          <h3 className="font-headline-sm text-headline-sm text-on-surface mb-sm">Détails de la correspondance</h3>
          <ul className="flex flex-col gap-3">
            {CRITERIA.map((criterion) => (
              <li key={criterion.label} className="flex items-center gap-3">
                <div
                  className={
                    criterion.matched
                      ? "w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0"
                      : "w-6 h-6 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant shrink-0"
                  }
                >
                  <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: `'FILL' ${criterion.matched ? 1 : 0}` }}>
                    check_circle
                  </span>
                </div>
                <span className={criterion.matched ? "font-body-md text-body-md text-on-surface" : "font-body-md text-body-md text-on-surface-variant"}>
                  {criterion.label}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <div className="fixed bottom-0 inset-x-0 z-50 glass-input px-container-margin py-md safe-area-pb shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="max-w-2xl mx-auto flex flex-col gap-sm">
          <Link
            href="/chat"
            className="w-full h-14 bg-primary text-on-primary rounded-xl font-headline-sm text-headline-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all"
          >
            <span className="material-symbols-outlined">forum</span>
            Contacter le déclarant
          </Link>
          <button
            type="button"
            onClick={() => router.back()}
            className="w-full h-12 bg-[#EBF2FF] text-primary rounded-xl font-headline-sm text-headline-sm hover:brightness-95 active:scale-[0.98] transition-all"
          >
            Ce n&apos;est pas mon objet
          </button>
        </div>
      </div>
    </div>
  );
}
