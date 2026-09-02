"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { saveDraft } from "@/lib/declarationDraft";

const CATEGORIES = [
  { id: "phone", label: "Téléphone", icon: "smartphone" },
  { id: "wallet", label: "Portefeuille", icon: "account_balance_wallet" },
  { id: "bag", label: "Sac", icon: "backpack" },
  { id: "keys", label: "Clés", icon: "key" },
  { id: "card", label: "Carte bancaire", icon: "credit_card" },
  { id: "clothes", label: "Vêtement", icon: "checkroom" },
  { id: "computer", label: "Ordinateur", icon: "computer" },
  { id: "headphones", label: "Écouteurs", icon: "headphones" },
  { id: "jewelry", label: "Bijou", icon: "diamond" },
  { id: "document", label: "Document", icon: "description" },
  { id: "other", label: "Autre", icon: "more_horiz" },
] as const;

export default function ReportFoundCategoryPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="font-body-md text-on-surface antialiased min-h-screen flex flex-col bg-background">
      <header className="w-full px-container-margin py-base flex items-center justify-between sticky top-0 z-50 bg-background/80 backdrop-blur-md">
        <Link href="/" aria-label="Retour" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high/50 transition-colors">
          <span className="material-symbols-outlined text-on-surface-variant">arrow_back</span>
        </Link>
        <div className="flex flex-col items-center">
          <span className="font-headline-sm text-headline-sm text-on-surface">Déclarer un objet</span>
        </div>
        <span className="font-body-md text-body-md text-[13px] text-on-surface-variant w-10 text-right">1/4</span>
      </header>

      <main className="grow w-full max-w-2xl mx-auto px-container-margin pt-md pb-40 flex flex-col">
        <div className="w-full flex items-center gap-2 mb-xl">
          <div className="h-1 flex-1 rounded-full progress-gradient" />
          <div className="h-1 flex-1 rounded-full bg-surface-container-highest" />
          <div className="h-1 flex-1 rounded-full bg-surface-container-highest" />
          <div className="h-1 flex-1 rounded-full bg-surface-container-highest" />
        </div>

        <div className="mb-xl">
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-2">Qu&apos;avez-vous trouvé ?</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Sélectionnez la catégorie de l&apos;objet que vous avez retrouvé.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-md">
          {CATEGORIES.map((category) => {
            const isSelected = selected === category.id;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => setSelected(category.id)}
                className={`relative flex flex-col items-center justify-center gap-2 p-lg rounded-2xl border transition-all active:scale-[0.98] ${
                  isSelected
                    ? "bg-primary-fixed border-primary shadow-[0px_4px_14px_rgba(0,88,188,0.15)]"
                    : "bg-surface-container-lowest border-outline-variant/40 hover:bg-surface-container-low"
                }`}
              >
                {isSelected && (
                  <span className="absolute top-2 right-2 material-symbols-outlined text-primary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    check_circle
                  </span>
                )}
                <span className={`material-symbols-outlined text-[32px] ${isSelected ? "text-primary" : "text-primary-container"}`}>{category.icon}</span>
                <span className={`font-body-md text-body-md text-center ${isSelected ? "text-primary font-semibold" : "text-on-surface"}`}>{category.label}</span>
              </button>
            );
          })}
        </div>
      </main>

      <div className="w-full fixed bottom-0 left-0 p-container-margin bg-background/90 backdrop-blur-xl border-t border-surface-container-highest z-40 pb-8">
        <div className="max-w-2xl mx-auto">
          <button
            type="button"
            disabled={!selected}
            onClick={() => {
              const category = CATEGORIES.find((c) => c.id === selected);
              if (!category) return;
              saveDraft({ type: "found", categoryId: category.id, categoryLabel: category.label, categoryIcon: category.icon });
              router.push("/report-found/details");
            }}
            className="btn-gradient w-full py-4 px-6 rounded-xl bg-primary text-on-primary font-headline-sm text-headline-sm shadow-[0px_10px_30px_rgba(0,88,188,0.15)] hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continuer
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
}
