"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { saveDraft } from "@/lib/declarationDraft";

const COLORS = ["Noir", "Blanc", "Gris", "Bleu", "Rouge", "Vert", "Marron", "Autre"];

export default function ReportFoundDetailsPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [color, setColor] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [privateDetail, setPrivateDetail] = useState("");

  const canContinue = name.trim().length > 0;

  const goNext = () => {
    if (!canContinue) return;
    saveDraft({ objectName: name, brand, color: color ?? undefined, description, privateDetail });
    router.push("/report-found/location");
  };

  return (
    <div className="font-body-md text-on-surface antialiased min-h-screen flex flex-col bg-background">
      <header
        className="w-full px-container-margin pb-base flex items-center justify-between sticky top-0 z-50 bg-background/80 backdrop-blur-md"
        style={{ paddingTop: "calc(0.5rem + env(safe-area-inset-top))" }}
      >
        <Link href="/report-found" aria-label="Retour" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high/50 transition-colors">
          <span className="material-symbols-outlined text-on-surface-variant">arrow_back</span>
        </Link>
        <span className="font-headline-sm text-headline-sm text-on-surface">Déclarer un objet</span>
        <span className="font-body-md text-body-md text-[13px] text-on-surface-variant w-10 text-right">2/4</span>
      </header>

      <main className="grow w-full max-w-2xl mx-auto px-container-margin pt-md pb-40 flex flex-col">
        <div className="w-full flex items-center gap-2 mb-xl">
          <div className="h-1 flex-1 rounded-full progress-gradient" />
          <div className="h-1 flex-1 rounded-full progress-gradient" />
          <div className="h-1 flex-1 rounded-full bg-surface-container-highest" />
          <div className="h-1 flex-1 rounded-full bg-surface-container-highest" />
        </div>

        <div className="mb-lg">
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-2">Décrivez l&apos;objet</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Donnez suffisamment de détails pour aider son propriétaire à le reconnaître.</p>
        </div>

        <button
          type="button"
          className="w-full h-44 mb-lg bg-surface-container-low rounded-2xl border-2 border-dashed border-outline-variant flex flex-col items-center justify-center gap-2 hover:bg-surface-container transition-colors"
        >
          <span className="w-12 h-12 rounded-full bg-surface-container-lowest shadow-sm flex items-center justify-center text-primary">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>add_a_photo</span>
          </span>
          <span className="font-label-md text-label-md text-on-surface-variant bg-surface-container-lowest/80 px-3 py-1 rounded-full">Ajouter une photo</span>
        </button>

        <div className="flex flex-col gap-lg">
          <div>
            <label className="block font-label-md text-[11px] text-outline uppercase tracking-wider mb-2" htmlFor="object-name">
              Nom de l&apos;objet
            </label>
            <input
              id="object-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Portefeuille noir"
              className="w-full bg-surface-container-lowest border border-surface-container-highest rounded-[16px] px-4 py-4 font-body-lg text-body-lg text-on-surface soft-shadow focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          <div>
            <label className="block font-label-md text-[11px] text-outline uppercase tracking-wider mb-2" htmlFor="object-brand">
              Marque
            </label>
            <input
              id="object-brand"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="Ex: Lacoste"
              className="w-full bg-surface-container-lowest border border-surface-container-highest rounded-[16px] px-4 py-4 font-body-lg text-body-lg text-on-surface soft-shadow focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          <div>
            <span className="block font-label-md text-[11px] text-outline uppercase tracking-wider mb-2">Couleur principale</span>
            <div className="flex flex-wrap gap-3">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`px-4 py-2 rounded-[16px] border font-body-md text-body-md transition-all ${
                    color === c
                      ? "bg-primary text-on-primary border-primary shadow-sm"
                      : "bg-surface-container-lowest text-on-surface border-surface-container-highest hover:bg-surface-container-low"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-label-md text-[11px] text-outline uppercase tracking-wider mb-2" htmlFor="object-desc">
              Description visible
            </label>
            <textarea
              id="object-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Décrivez l'état, le contenu..."
              className="w-full bg-surface-container-lowest border border-surface-container-highest rounded-[16px] px-4 py-4 font-body-lg text-body-lg text-on-surface soft-shadow focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-secondary">
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
              <span className="font-label-md text-[11px] uppercase tracking-wider">Information privée</span>
            </div>
            <div className="relative bg-surface-container-lowest rounded-[16px] border border-secondary-fixed-dim soft-shadow overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary" />
              <textarea
                value={privateDetail}
                onChange={(e) => setPrivateDetail(e.target.value)}
                rows={2}
                placeholder="Un détail visible uniquement par le propriétaire..."
                className="w-full bg-transparent border-none pl-5 pr-4 py-4 font-body-lg text-body-lg text-on-surface focus:outline-none focus:ring-0 resize-none"
              />
              <p className="font-body-md text-[12px] text-on-surface-variant pl-5 pr-4 pb-3 leading-tight">
                Cette information servira à vérifier l&apos;identité du propriétaire lors de la réclamation.
              </p>
            </div>
          </div>
        </div>
      </main>

      <div className="w-full fixed bottom-0 left-0 p-container-margin bg-background/90 backdrop-blur-xl border-t border-surface-container-highest z-40 pb-8">
        <div className="max-w-2xl mx-auto flex justify-between items-center gap-md">
          <Link href="/report-found" className="text-primary font-headline-sm text-headline-sm px-4 py-2 hover:opacity-80 transition-opacity">
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
        </div>
      </div>
    </div>
  );
}
