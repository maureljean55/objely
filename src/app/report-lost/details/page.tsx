"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { saveDraft } from "@/lib/declarationDraft";

const COLORS = ["Noir", "Blanc", "Gris", "Bleu", "Rouge", "Vert", "Marron", "Autre"];

export default function DeclarationDetailsPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [brand, setBrand] = useState("");
  const [color, setColor] = useState<string | null>(null);
  const [distinctive, setDistinctive] = useState("");

  const canContinue = name.trim().length > 0;

  return (
    <div className="font-body-md text-on-surface antialiased min-h-screen flex flex-col bg-background">
      <header className="w-full px-container-margin py-base flex items-center justify-between sticky top-0 z-50 bg-background/80 backdrop-blur-md">
        <Link href="/report-lost" aria-label="Retour" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high/50 transition-colors">
          <span className="material-symbols-outlined text-on-surface-variant">arrow_back</span>
        </Link>
        <div className="font-headline-sm text-headline-sm text-on-surface">Déclarer un objet</div>
        <Link href="/home" aria-label="Fermer" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high/50 transition-colors">
          <span className="material-symbols-outlined text-on-surface-variant">close</span>
        </Link>
      </header>

      <main className="grow w-full max-w-2xl mx-auto px-container-margin pt-md pb-40 flex flex-col">
        <div className="w-full flex items-center gap-2 mb-xl">
          <div className="h-1 flex-1 rounded-full progress-gradient" />
          <div className="h-1 flex-1 rounded-full progress-gradient" />
          <div className="h-1 flex-1 rounded-full bg-surface-container-highest" />
          <div className="h-1 flex-1 rounded-full bg-surface-container-highest" />
        </div>

        <div className="mb-xl">
          <h1 className="font-headline-md text-headline-md text-on-surface mb-2">Parlez-nous de votre objet</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">Ajoutez quelques détails pour nous aider à retrouver votre objet.</p>
        </div>

        <div className="mb-lg">
          <label className="block font-label-md text-label-md text-outline uppercase tracking-wider mb-2">Photos</label>
          <button
            type="button"
            className="w-full h-48 bg-surface-container-lowest rounded-[24px] border border-dashed border-outline-variant flex flex-col items-center justify-center p-6 text-center soft-shadow hover:bg-surface-container-low transition-colors"
          >
            <span className="material-symbols-outlined text-4xl text-primary mb-3">photo_camera</span>
            <span className="font-headline-sm text-headline-sm text-primary mb-1">Ajouter une photo</span>
            <span className="font-body-md text-body-md text-on-surface-variant">Prenez une photo ou choisissez-en une depuis votre galerie</span>
          </button>
        </div>

        <form
          className="flex flex-col gap-lg"
          onSubmit={(e) => {
            e.preventDefault();
            if (!canContinue) return;
            saveDraft({ objectName: name, description, brand, color: color ?? undefined });
            router.push("/report-lost/location");
          }}
        >
          <div>
            <label className="block font-label-md text-label-md text-outline uppercase tracking-wider mb-2" htmlFor="object-name">
              Nom de l&apos;objet
            </label>
            <input
              id="object-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Portefeuille"
              className="w-full bg-surface-container-lowest border border-surface-container-highest rounded-[16px] px-4 py-4 font-body-lg text-body-lg text-on-surface soft-shadow focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          <div>
            <label className="block font-label-md text-label-md text-outline uppercase tracking-wider mb-2" htmlFor="object-desc">
              Décrivez votre objet
            </label>
            <textarea
              id="object-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Ex: Portefeuille en cuir véritable contenant..."
              className="w-full bg-surface-container-lowest border border-surface-container-highest rounded-[16px] px-4 py-4 font-body-lg text-body-lg text-on-surface soft-shadow focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
            />
          </div>

          <div>
            <label className="block font-label-md text-label-md text-outline uppercase tracking-wider mb-2" htmlFor="object-brand">
              Marque (Optionnel)
            </label>
            <input
              id="object-brand"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="Ex: Bellroy"
              className="w-full bg-surface-container-lowest border border-surface-container-highest rounded-[16px] px-4 py-4 font-body-lg text-body-lg text-on-surface soft-shadow focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          <div>
            <label className="block font-label-md text-label-md text-outline uppercase tracking-wider mb-2">Couleur principale</label>
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
            <label className="block font-label-md text-label-md text-outline uppercase tracking-wider mb-2" htmlFor="object-distinct">
              Éléments distinctifs
            </label>
            <input
              id="object-distinct"
              value={distinctive}
              onChange={(e) => setDistinctive(e.target.value)}
              placeholder="Ex: rayure sur le cuir"
              className="w-full bg-surface-container-lowest border border-surface-container-highest rounded-[16px] px-4 py-4 font-body-lg text-body-lg text-on-surface soft-shadow focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        </form>
      </main>

      <div className="w-full fixed bottom-0 left-0 p-container-margin bg-background/90 backdrop-blur-xl border-t border-surface-container-highest z-40 pb-8">
        <div className="max-w-2xl mx-auto flex justify-between items-center gap-md">
          <Link href="/report-lost" className="text-primary font-headline-sm text-headline-sm px-4 py-2 hover:opacity-80 transition-opacity">
            Retour
          </Link>
          <button
            type="button"
            disabled={!canContinue}
            onClick={() => {
              saveDraft({ objectName: name, description, brand, color: color ?? undefined });
              router.push("/report-lost/location");
            }}
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
