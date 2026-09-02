"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { saveDraft } from "@/lib/declarationDraft";

const MOMENTS = ["Matin", "Midi", "Après-midi", "Soir", "Nuit", "Je ne sais pas"];

export default function DeclarationLocationPage() {
  const router = useRouter();
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("2026-09-02");
  const [moment, setMoment] = useState("Après-midi");
  const [details, setDetails] = useState("");

  const canContinue = location.trim().length > 0;

  const goNext = () => {
    saveDraft({ location, date });
    router.push("/report-lost/matches");
  };

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col antialiased">
      <header className="bg-surface/80 backdrop-blur-xl flex items-center justify-between px-container-margin h-16 w-full z-50 sticky top-0">
        <Link href="/report-lost/details" aria-label="Retour" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high/50 transition-colors text-on-surface-variant">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <h1 className="font-headline-sm text-headline-sm text-on-surface">Déclarer un objet</h1>
        <Link href="/home" aria-label="Fermer" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high/50 transition-colors text-on-surface-variant">
          <span className="material-symbols-outlined">close</span>
        </Link>
      </header>

      <main className="grow overflow-y-auto pb-[140px]">
        <div className="px-container-margin py-md flex flex-col gap-lg max-w-2xl mx-auto">
          <div className="flex items-center gap-2 w-full pt-2">
            <div className="h-1.5 flex-1 rounded-full progress-gradient" />
            <div className="h-1.5 flex-1 rounded-full progress-gradient" />
            <div className="h-1.5 flex-1 rounded-full progress-gradient" />
            <div className="h-1.5 flex-1 rounded-full bg-surface-container-highest" />
          </div>

          <section className="flex flex-col gap-2">
            <h2 className="font-headline-md text-headline-md text-on-surface">Où avez-vous perdu votre objet ?</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">Indiquez l&apos;endroit et le moment où vous pensez l&apos;avoir perdu.</p>
          </section>

          <section className="flex flex-col gap-md">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">search</span>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Rechercher un lieu, une adresse..."
                className="w-full h-14 pl-12 pr-4 bg-surface-container-lowest border border-outline-variant rounded-[16px] font-body-lg text-body-lg text-on-surface placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary-container transition-all outline-none soft-shadow"
              />
            </div>

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

            <button className="flex items-center gap-2 self-start py-2 px-1 rounded-lg text-primary font-headline-sm text-headline-sm hover:opacity-80 transition-opacity active:scale-95">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>my_location</span>
              Utiliser ma position actuelle
            </button>
          </section>

          <hr className="border-outline-variant/30" />

          <section className="flex flex-col gap-md">
            <div>
              <label className="block font-label-md text-label-md text-outline uppercase tracking-wider mb-2" htmlFor="date-input">Date de perte</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">calendar_today</span>
                <input
                  id="date-input"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full h-14 pl-12 pr-4 bg-surface-container-lowest border border-outline-variant rounded-[16px] font-body-lg text-body-lg text-on-surface focus:border-primary focus:ring-2 focus:ring-primary-container transition-all outline-none soft-shadow"
                />
              </div>
            </div>

            <div>
              <span className="block font-label-md text-label-md text-outline uppercase tracking-wider mb-3">Moment approximatif</span>
              <div className="flex flex-wrap gap-2">
                {MOMENTS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMoment(m)}
                    className={`px-5 py-2.5 rounded-full font-body-md text-[14px] transition-colors ${
                      moment === m
                        ? "bg-primary text-on-primary shadow-sm"
                        : "border border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface-container"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-2">
            <label className="block font-label-md text-label-md text-outline uppercase tracking-wider mb-1" htmlFor="details-input">Précisions sur le lieu</label>
            <textarea
              id="details-input"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Ex: Près de l'entrée principale, dans le bus ligne 4..."
              className="w-full p-4 bg-surface-container-lowest border border-outline-variant rounded-[16px] font-body-lg text-body-lg text-on-surface placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary-container transition-all outline-none soft-shadow min-h-[120px] resize-none"
            />
          </section>

          <div className="flex items-start gap-3 p-4 bg-surface-container-low rounded-[16px]">
            <span className="material-symbols-outlined text-outline mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Votre adresse exacte ne sera jamais affichée publiquement. Elle aide uniquement nos algorithmes de rapprochement.
            </p>
          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 w-full z-50 flex justify-between items-center px-container-margin py-md pb-8 bg-surface/80 backdrop-blur-xl rounded-t-xl shadow-lg">
        <Link href="/report-lost/details" className="text-primary font-headline-sm text-headline-sm px-4 py-2 hover:opacity-80 transition-opacity flex items-center gap-2">
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
