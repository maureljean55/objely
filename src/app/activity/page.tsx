import Link from "next/link";
import BottomNav from "@/components/BottomNav";

const FILTERS = ["Tout", "Correspondances", "Messages", "Restitutions"];

export default function ActivityPage() {
  return (
    <div className="bg-background text-on-background font-body-md antialiased min-h-screen pb-28 md:pb-12">
      <header className="glass-header fixed top-0 inset-x-0 z-50 flex items-center justify-between px-container-margin h-16 w-full shadow-[0_1px_0_rgba(0,0,0,0.05)]">
        <h1 className="font-display text-headline-lg-mobile text-headline-lg-mobile text-primary">Activité</h1>
        <button aria-label="Notifications" className="relative p-2 text-on-surface-variant hover:text-primary transition-colors">
          <span className="material-symbols-outlined text-[24px]">notifications</span>
          <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-error ring-2 ring-surface" />
        </button>
      </header>

      <main className="pt-[88px] max-w-2xl mx-auto">
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
          {/* Match */}
          <article className="bg-surface-container-lowest rounded-2xl soft-shadow inner-stroke overflow-hidden">
            <div className="p-md border-b border-surface-variant/60 flex gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-container/10 flex items-center justify-center shrink-0 text-primary-container">
                <span className="material-symbols-outlined">my_location</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <h2 className="font-headline-sm text-headline-sm text-on-surface">Nouvelle correspondance</h2>
                  <span className="font-label-md text-label-md text-on-surface-variant shrink-0">Il y a 5 min</span>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Une correspondance possible a été trouvée pour votre portefeuille.
                </p>
              </div>
            </div>
            <div className="p-md bg-surface-container-low flex gap-4 items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt="Portefeuille marron"
                className="w-16 h-16 rounded-xl object-cover shadow-sm"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAVZe46M5x8qXC3h2DOyPoXkYVWeSoWvUI435nRmzIEN1--7pMtaNWlk5Q1VgJPLx5-9u1tGeX6RXZVid3X_lCQXQXvJ4RONcKjQgHs1xyix2HmYk3xP2Q_6HqqILnEqmy7OYiTPFbfsmrEDqLL_A5nESIp-crOQwnTx7lX1jycLQKt2M4SCAdqpKh8mf_5vnYQeena3JPsC1iX82LLXIUKK838cpHi4nelFNdi4dimAk59ayExXFzs"
              />
              <div className="flex-1">
                <p className="font-headline-sm text-headline-sm text-on-surface">Portefeuille marron</p>
                <div className="flex items-center gap-1 mt-1 text-tertiary">
                  <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  <span className="font-label-md text-label-md">96% de correspondance</span>
                </div>
              </div>
            </div>
            <div className="p-md">
              <Link
                href="/activity/match"
                className="w-full h-14 bg-primary text-on-primary rounded-xl font-headline-sm text-headline-sm hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center"
              >
                Voir la correspondance
              </Link>
            </div>
          </article>

          {/* Message */}
          <article className="bg-surface-container-lowest rounded-2xl soft-shadow inner-stroke p-md">
            <div className="flex gap-3 mb-md">
              <div className="w-10 h-10 rounded-full bg-secondary-container/10 flex items-center justify-center shrink-0 text-secondary-container">
                <span className="material-symbols-outlined">chat</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <h2 className="font-headline-sm text-headline-sm text-on-surface">Nouveau message</h2>
                  <span className="font-label-md text-label-md text-on-surface-variant shrink-0">Il y a 12 min</span>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Jean D. vous a envoyé un message concernant votre objet.
                </p>
              </div>
            </div>
            <Link
              href="/chat"
              className="w-full h-14 bg-[#EBF2FF] text-primary rounded-xl font-headline-sm text-headline-sm hover:brightness-95 transition-all flex items-center justify-center"
            >
              Continuer la discussion
            </Link>
          </article>

          {/* Verification */}
          <article className="bg-surface-container-lowest rounded-2xl soft-shadow inner-stroke p-md">
            <div className="flex gap-3 mb-md">
              <div className="w-10 h-10 rounded-full bg-error-container/60 flex items-center justify-center shrink-0 text-error">
                <span className="material-symbols-outlined">lock_open</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <h2 className="font-headline-sm text-headline-sm text-on-surface">Vérification de propriété</h2>
                  <span className="font-label-md text-label-md text-on-surface-variant shrink-0">Il y a 20 min</span>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Une vérification est nécessaire avant la restitution.
                </p>
              </div>
            </div>
            <Link
              href="/activity/verification"
              className="w-full h-14 bg-surface-container-lowest border-2 border-outline-variant text-on-surface rounded-xl font-headline-sm text-headline-sm hover:bg-surface-container-low transition-all flex items-center justify-center"
            >
              Voir la demande
            </Link>
          </article>
        </div>
      </main>

      <BottomNav active="activity" />
    </div>
  );
}
