"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { clearDraft, loadDraft, type DeclarationDraft } from "@/lib/declarationDraft";

export default function DeclarationConfirmationPage() {
  const [draft, setDraft] = useState<DeclarationDraft>({});

  useEffect(() => {
    // sessionStorage is only readable client-side, so this can't happen
    // during render without risking an SSR/hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraft(loadDraft());
    clearDraft();
  }, []);

  return (
    <div className="bg-background text-on-surface antialiased min-h-screen flex flex-col relative overflow-hidden font-body-md">
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-fixed via-background to-background z-0" />

      <main className="grow z-10 px-container-margin pt-12 pb-40 flex flex-col items-center justify-center gap-lg max-w-md mx-auto w-full text-center">
        <header className="flex flex-col items-center gap-2">
          <div className="w-20 h-20 rounded-full bg-primary-fixed text-primary flex items-center justify-center mb-4 soft-shadow">
            <span className="material-symbols-outlined text-[40px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          </div>
          <h1 className="font-headline-md text-headline-md text-on-surface">Votre objet est maintenant recherché ! 🎉</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">Votre déclaration a bien été enregistrée.</p>
        </header>

        <div className="w-full bg-surface-container-lowest rounded-2xl soft-shadow overflow-hidden">
          <div className="h-48 w-full bg-surface-variant relative overflow-hidden">
            <div className="w-full h-full flex items-center justify-center bg-surface-container-high text-primary">
              <span className="material-symbols-outlined text-6xl">{draft.categoryIcon || "inventory_2"}</span>
            </div>
            <div className="absolute top-4 right-4 bg-surface-container-lowest/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm border border-surface-container-highest">
              <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
              <span className="font-label-md text-[11px] text-on-surface uppercase tracking-wider">Recherche active</span>
            </div>
          </div>
          <div className="p-5 flex flex-col gap-4 text-left">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="font-headline-sm text-headline-sm text-on-surface">{draft.objectName || draft.categoryLabel || "Votre objet"}</h2>
                <div className="flex items-center gap-1 text-on-surface-variant mt-1">
                  <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                  <span className="font-body-md text-[13px]">Perdu le {draft.date ? new Date(draft.date).toLocaleDateString("fr-FR") : "12 octobre"}</span>
                </div>
              </div>
              <div className="bg-surface-container rounded-lg p-2 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>{draft.categoryIcon || "inventory_2"}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-surface p-3 rounded-xl border border-surface-variant">
              <span className="material-symbols-outlined text-on-surface-variant text-[20px]">location_on</span>
              <span className="font-body-md text-[13px] text-on-surface">{draft.location || "Paris"}</span>
            </div>
            <p className="font-body-md text-[13px] text-on-surface-variant pt-2 border-t border-surface-variant/50">
              Objely surveillera les nouveaux objets trouvés et vous avertira si une correspondance est détectée.
            </p>
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 w-full z-50 bg-surface/80 backdrop-blur-xl px-container-margin py-md pb-8 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] border-t border-surface-variant/30">
        <div className="max-w-md mx-auto flex flex-col gap-3">
          <Link
            href="/search"
            className="w-full bg-primary btn-gradient text-on-primary font-headline-sm text-headline-sm h-14 rounded-2xl flex items-center justify-center gap-2 transition-transform active:scale-95"
          >
            Voir mon objet
            <span className="material-symbols-outlined text-[20px]">visibility</span>
          </Link>
          <Link
            href="/home"
            className="w-full bg-primary-fixed text-primary font-headline-sm text-headline-sm h-14 rounded-2xl flex items-center justify-center transition-transform active:scale-95"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
