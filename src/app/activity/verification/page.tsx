"use client";

import { useRouter } from "next/navigation";

const ANSWERS = [
  { question: "Marque exacte ?", answer: "Montblanc" },
  { question: "Quel détail particulier se trouve à l'intérieur ?", answer: "Une ancienne carte de fidélité rouge." },
  { question: "Quel élément distinctif possède l'objet ?", answer: "Une petite rayure sur le coin gauche." },
];

export default function VerificationReviewPage() {
  const router = useRouter();

  return (
    <div className="bg-background text-on-background font-body-md antialiased min-h-screen pb-[180px]">
      <header className="glass-header fixed top-0 inset-x-0 z-50 flex items-center justify-between px-container-margin min-h-16 pt-[env(safe-area-inset-top)] w-full shadow-[0_1px_0_rgba(0,0,0,0.05)]">
        <button type="button" onClick={() => router.back()} aria-label="Retour" className="w-10 h-10 flex items-center justify-center rounded-full text-primary hover:bg-surface-container-high/50 transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="font-headline-sm text-headline-sm text-on-surface flex-1 text-center truncate px-2">Vérification de propriété</h1>
        <button type="button" onClick={() => router.back()} aria-label="Fermer" className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high/50 transition-colors">
          <span className="material-symbols-outlined">close</span>
        </button>
      </header>

      <main className="pt-[calc(104px+env(safe-area-inset-top))] px-container-margin max-w-2xl mx-auto">
        <div className="mb-lg text-center">
          <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-background mb-sm">Vérification de propriété</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Comparez les réponses du déclarant avec les détails que vous connaissez sur l&apos;objet.
          </p>
        </div>

        <div className="flex flex-col gap-md">
          {ANSWERS.map((item) => (
            <div key={item.question} className="bg-surface-container-lowest rounded-2xl p-lg soft-shadow">
              <div className="flex items-start gap-md">
                <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center shrink-0 text-on-surface-variant">
                  <span className="material-symbols-outlined">help</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-label-md text-label-md text-on-surface-variant uppercase mb-1">Question de sécurité</h3>
                  <p className="font-headline-sm text-headline-sm text-on-background mb-sm">{item.question}</p>
                  <div className="bg-surface-container-low p-md rounded-xl border border-outline-variant/30">
                    <span className="font-label-md text-label-md text-on-surface-variant uppercase block mb-1">Réponse du déclarant</span>
                    <p className="font-body-lg text-body-lg text-on-background font-medium">{item.answer}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <div className="fixed bottom-0 inset-x-0 z-50 glass-input px-container-margin py-md safe-area-pb shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="max-w-2xl mx-auto flex flex-col gap-sm">
          <button
            type="button"
            onClick={() => router.push("/schedule-return")}
            className="w-full h-14 bg-tertiary text-on-tertiary rounded-xl font-headline-sm text-headline-sm flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all"
          >
            <span className="material-symbols-outlined">check_circle</span>
            Les informations correspondent
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="w-full h-14 bg-[#EBF2FF] text-primary rounded-xl font-headline-sm text-headline-sm flex items-center justify-center gap-2 hover:brightness-95 active:scale-[0.98] transition-all"
          >
            <span className="material-symbols-outlined">cancel</span>
            Je ne suis pas convaincu
          </button>
        </div>
      </div>
    </div>
  );
}
