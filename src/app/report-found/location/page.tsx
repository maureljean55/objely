"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { saveDraft } from "@/lib/declarationDraft";

export default function ReportFoundLocationPage() {
  const router = useRouter();
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("2026-09-02");
  const [time, setTime] = useState("18:30");
  const [hideExactLocation, setHideExactLocation] = useState(true);

  const canContinue = location.trim().length > 0;

  const goNext = () => {
    if (!canContinue) return;
    saveDraft({ location, date, time, hideExactLocation });
    router.push("/report-found/matches");
  };

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col antialiased">
      <header className="bg-surface/80 backdrop-blur-xl flex items-center justify-between px-container-margin min-h-16 pt-[env(safe-area-inset-top)] w-full z-50 sticky top-0">
        <Link href="/report-found/details" aria-label="Retour" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high/50 transition-colors text-on-surface-variant">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <h1 className="font-headline-sm text-headline-sm text-on-surface">Déclarer un objet</h1>
        <span className="font-body-md text-body-md text-[13px] text-on-surface-variant w-10 text-right">3/4</span>
      </header>

      <main className="grow overflow-y-auto pb-[160px]">
        <div className="px-container-margin py-md flex flex-col gap-lg max-w-2xl mx-auto">
          <div className="flex items-center gap-2 w-full pt-2">
            <div className="h-1.5 flex-1 rounded-full progress-gradient" />
            <div className="h-1.5 flex-1 rounded-full progress-gradient" />
            <div className="h-1.5 flex-1 rounded-full progress-gradient" />
            <div className="h-1.5 flex-1 rounded-full bg-surface-container-highest" />
          </div>

          <section className="flex flex-col gap-2">
            <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">Où l&apos;avez-vous trouvé ?</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">Indiquez approximativement où et quand vous avez retrouvé cet objet.</p>
          </section>

          <section className="flex flex-col gap-md">
            <div className="w-full h-48 rounded-[24px] overflow-hidden relative soft-shadow bg-surface-container">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt="Aperçu de la carte"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDkQ5S7PrVoIgHzx-1fYIrGhkmvpLA61kRqngDy1dfOBUxKBA82PPfOI5zMXpS5kSmwQx7ykIUjLoKrOgt0zXvC_13-NyfqZyVmNOOrDXr4TGZ7FaDPo3fv9-dltpjr12gnjO3tGYufEgn1H9nFO32NPIf_LwJT3pQnp1T5Y-Fr6bq45CecZtfpsLpiKwdmvpdz-2hB_-FwQ1JsKEvLTFJIgsRyF7U157auGEhh6YhprPDOPZMBufcnEw"
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
                <span className="material-symbols-outlined text-[40px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
              </div>
            </div>

            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">search</span>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ex: Gare d'Étampes"
                className="w-full h-14 pl-12 pr-4 bg-surface-container-lowest border border-outline-variant rounded-[16px] font-body-lg text-body-lg text-on-surface placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary-container transition-all outline-none soft-shadow"
              />
            </div>

            <button className="flex items-center gap-2 self-start py-2 px-1 rounded-lg text-primary font-headline-sm text-headline-sm hover:opacity-80 transition-opacity active:scale-95">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>my_location</span>
              Utiliser ma position actuelle
            </button>
          </section>

          <section className="bg-surface-container-lowest rounded-[16px] border border-outline-variant/40 soft-shadow overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant/30">
              <span className="font-body-lg text-body-lg text-on-surface">Date</span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-transparent border-none p-0 text-right font-body-lg text-body-lg text-on-surface-variant focus:ring-0"
              />
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="font-body-lg text-body-lg text-on-surface">Heure</span>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="bg-transparent border-none p-0 text-right font-body-lg text-body-lg text-on-surface-variant focus:ring-0"
              />
            </div>
          </section>

          <section className="flex flex-col gap-2">
            <div className="bg-surface-container-lowest rounded-[16px] border border-outline-variant/40 soft-shadow overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3">
                <span className="font-body-lg text-body-lg text-on-surface">Masquer l&apos;emplacement exact</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={hideExactLocation}
                  onClick={() => setHideExactLocation((v) => !v)}
                >
                  <span className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${hideExactLocation ? "bg-emerald-500" : "bg-surface-container-highest"}`}>
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${hideExactLocation ? "translate-x-5" : "translate-x-0.5"}`} />
                  </span>
                </button>
              </div>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant px-1">
              Si activé, seul un périmètre approximatif sera communiqué à la personne recherchant son objet, préservant ainsi votre vie privée jusqu&apos;à la rencontre.
            </p>
          </section>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 w-full z-50 flex justify-between items-center px-container-margin py-md pb-8 bg-surface/80 backdrop-blur-xl rounded-t-xl shadow-lg">
        <Link href="/report-found/details" className="text-primary font-headline-sm text-headline-sm px-4 py-2 hover:opacity-80 transition-opacity flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          Retour
        </Link>
        <button
          type="button"
          disabled={!canContinue}
          onClick={goNext}
          className="btn-gradient bg-primary text-on-primary rounded-xl px-6 py-3 flex items-center justify-center gap-2 font-headline-sm text-headline-sm shadow-[0px_10px_30px_rgba(0,88,188,0.15)] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continuer
          <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
        </button>
      </footer>
    </div>
  );
}
