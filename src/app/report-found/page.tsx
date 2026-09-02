"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { saveDraft } from "@/lib/declarationDraft";

const CATEGORIES = [
  {
    id: "phone",
    label: "Téléphone",
    icon: "smartphone",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop",
  },
  {
    id: "wallet",
    label: "Portefeuille",
    icon: "account_balance_wallet",
    image: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&h=400&fit=crop",
  },
  {
    id: "bag",
    label: "Sac",
    icon: "backpack",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop",
  },
  {
    id: "keys",
    label: "Clés",
    icon: "key",
    image: "https://upload.wikimedia.org/wikipedia/commons/3/3c/House_key.jpg",
  },
  {
    id: "card",
    label: "Carte bancaire",
    icon: "credit_card",
    image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=400&fit=crop",
  },
  {
    id: "clothes",
    label: "Vêtement",
    icon: "checkroom",
    image: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400&h=400&fit=crop",
  },
  {
    id: "computer",
    label: "Ordinateur",
    icon: "computer",
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop",
  },
  {
    id: "headphones",
    label: "Écouteurs",
    icon: "headphones",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
  },
  {
    id: "jewelry",
    label: "Bijou",
    icon: "diamond",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop",
  },
  {
    id: "document",
    label: "Document",
    icon: "description",
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&h=400&fit=crop",
  },
  {
    id: "other",
    label: "Autre objet",
    icon: "more_horiz",
    image: "https://images.unsplash.com/photo-1607166452427-7e4477079cb9?w=400&h=400&fit=crop",
    mystery: true,
  },
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

        <div className="grid grid-cols-2 md:grid-cols-3 gap-md grow content-start">
          {CATEGORIES.map((category) => {
            const isSelected = selected === category.id;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => setSelected(category.id)}
                className={`category-card relative rounded-2xl overflow-hidden aspect-square border-2 transition-all group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                  isSelected ? "border-primary shadow-lg" : "border-transparent hover:border-surface-container-high"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={category.image}
                  alt={category.label}
                  className={`absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                    "mystery" in category && category.mystery ? "blur-md scale-110" : ""
                  }`}
                />
                <div
                  className={`absolute inset-0 transition-colors ${
                    isSelected ? "bg-primary/25" : "bg-black/15 group-hover:bg-black/5"
                  }`}
                />
                {"mystery" in category && category.mystery && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-5xl drop-shadow-md" style={{ fontVariationSettings: "'FILL' 1" }}>
                      help
                    </span>
                  </div>
                )}
                {isSelected && (
                  <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-primary flex items-center justify-center shadow-md">
                    <span className="material-symbols-outlined text-white text-[18px]">check</span>
                  </div>
                )}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent px-3 pt-8 pb-2.5">
                  <span className="font-label-md text-label-md text-white">{category.label}</span>
                </div>
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
