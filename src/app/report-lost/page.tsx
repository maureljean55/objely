"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const CATEGORIES = [
  { id: "phone", label: "Téléphone", icon: "smartphone" },
  { id: "bag", label: "Sac & Bagage", icon: "backpack" },
  { id: "wallet", label: "Portefeuille", icon: "account_balance_wallet" },
  { id: "keys", label: "Clés", icon: "key" },
  { id: "clothes", label: "Vêtements", icon: "styler" },
  { id: "other", label: "Autre objet", icon: "more_horiz" },
] as const;

export default function ReportLostCategoryPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="font-body-md text-on-surface antialiased min-h-screen flex flex-col bg-background">
      <header className="w-full px-container-margin py-base flex items-center justify-between sticky top-0 z-50 bg-background/80 backdrop-blur-md">
        <Link href="/" aria-label="Retour" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high/50 transition-colors">
          <span className="material-symbols-outlined text-on-surface-variant">arrow_back</span>
        </Link>
        <div className="font-headline-sm text-headline-sm text-on-surface">Déclarer un objet</div>
        <Link href="/" aria-label="Fermer" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high/50 transition-colors">
          <span className="material-symbols-outlined text-on-surface-variant">close</span>
        </Link>
      </header>

      <main className="grow w-full max-w-3xl mx-auto px-container-margin pt-md pb-40 flex flex-col">
        <div className="w-full flex items-center gap-2 mb-xl">
          <div className="h-1 flex-1 rounded-full progress-gradient" />
          <div className="h-1 flex-1 rounded-full bg-surface-container-highest" />
          <div className="h-1 flex-1 rounded-full bg-surface-container-highest" />
          <div className="h-1 flex-1 rounded-full bg-surface-container-highest" />
        </div>
        <div className="text-center mb-xl">
          <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-xs">
            Quel objet avez-vous perdu ?
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">Sélectionnez la catégorie qui correspond le mieux.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-md grow content-start">
          {CATEGORIES.map((category) => {
            const isSelected = selected === category.id;
            const isOther = category.id === "other";
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => setSelected(category.id)}
                className={`category-card glass-panel rounded p-md flex flex-col items-center justify-center aspect-square gap-3 border group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                  isSelected ? "ring-2 ring-primary border-surface-container-high" : "border-surface-container-high"
                }`}
              >
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
                    isSelected ? "bg-primary" : isOther ? "bg-surface-container-high group-hover:bg-surface-variant" : "bg-primary-container/10 group-hover:bg-primary-container/20"
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-3xl ${
                      isSelected ? "text-white" : isOther ? "text-on-surface-variant" : "text-primary"
                    }`}
                    style={!isOther ? { fontVariationSettings: "'FILL' 1" } : undefined}
                  >
                    {category.icon}
                  </span>
                </div>
                <span className="font-label-md text-label-md text-on-surface">{category.label}</span>
              </button>
            );
          })}
        </div>
      </main>

      <div className="w-full fixed bottom-0 left-0 p-container-margin bg-background/90 backdrop-blur-xl border-t border-surface-container-highest z-40 pb-8">
        <div className="max-w-3xl mx-auto flex gap-md">
          <Link
            href="/"
            className="flex-1 py-4 px-6 rounded border border-[#007AFF] text-[#007AFF] font-headline-sm text-headline-sm bg-surface-container-lowest shadow-sm hover:bg-surface-container-low transition-colors text-center"
          >
            Annuler
          </Link>
          <button
            type="button"
            disabled={!selected}
            onClick={() => router.push("/matching")}
            className="btn-gradient flex-[2] py-4 px-6 rounded bg-[#007AFF] text-white font-headline-sm text-headline-sm shadow-[0px_4px_14px_rgba(0,122,255,0.3)] hover:opacity-90 transition-opacity text-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continuer
          </button>
        </div>
      </div>
    </div>
  );
}
