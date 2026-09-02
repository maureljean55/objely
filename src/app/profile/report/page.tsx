"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";

const CATEGORIES = [
  { value: "tech", label: "Problème technique" },
  { value: "fake", label: "Faux objet" },
  { value: "info", label: "Mauvaise information" },
  { value: "other", label: "Autre" },
];

export default function ReportProblemPage() {
  const router = useRouter();
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = category !== "" && description.trim().length > 0;

  return (
    <div className="bg-background text-on-surface antialiased min-h-screen pb-32">
      <header className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-container-margin min-h-14 pt-[env(safe-area-inset-top)] bg-surface/80 backdrop-blur-xl border-b border-outline-variant/30">
        <Link href="/profile" aria-label="Retour" className="p-2 -ml-2 text-primary hover:opacity-70 transition-opacity active:scale-95 flex items-center justify-center">
          <span className="material-symbols-outlined">arrow_back_ios</span>
        </Link>
        <h1 className="font-headline-sm text-headline-sm text-on-surface">Signaler un problème</h1>
        <div className="w-10" />
      </header>

      <main className="pt-[calc(5rem+env(safe-area-inset-top))] px-container-margin max-w-2xl mx-auto pb-8">
        {submitted ? (
          <div className="flex flex-col items-center text-center py-xl">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-emerald-600 text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
            <h2 className="font-headline-md text-headline-md text-on-surface mb-2">Signalement envoyé</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mb-lg max-w-sm">
              Merci ! Notre équipe va examiner votre signalement dans les plus brefs délais.
            </p>
            <Link href="/profile" className="bg-primary text-on-primary py-3 px-8 rounded-full font-body-lg text-body-lg font-semibold hover:opacity-90 transition-opacity">
              Retour au profil
            </Link>
          </div>
        ) : (
          <>
            <p className="font-body-lg text-body-lg text-on-surface-variant mb-8">
              Votre signalement nous aide à améliorer Objely.
            </p>
            <form
              className="flex flex-col gap-lg"
              onSubmit={(e) => {
                e.preventDefault();
                setSubmitted(true);
                setTimeout(() => router.push("/profile"), 1600);
              }}
            >
              <div className="bg-surface-container-lowest rounded-xl soft-shadow p-4">
                <label className="block font-label-md text-label-md text-on-surface-variant mb-2" htmlFor="category">
                  Sélectionner une catégorie
                </label>
                <div className="relative">
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant/50 text-on-surface font-body-lg text-body-lg rounded-lg px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors appearance-none"
                  >
                    <option disabled value="">Choisissez une option...</option>
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
                </div>
              </div>

              <button type="button" className="w-full bg-surface-container-lowest rounded-xl soft-shadow p-4 flex items-center justify-between active:scale-[0.98] transition-transform">
                <div className="flex items-center gap-3 text-on-surface">
                  <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-full">inventory_2</span>
                  <span className="font-body-lg text-body-lg">Sélectionner un objet concerné</span>
                </div>
                <span className="material-symbols-outlined text-outline-variant">chevron_right</span>
              </button>

              <div className="bg-surface-container-lowest rounded-xl soft-shadow p-4">
                <label className="block font-label-md text-label-md text-on-surface-variant mb-2" htmlFor="description">
                  Décrivez le problème
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  placeholder="Expliquez-nous ce qui s'est passé..."
                  className="w-full bg-surface-container-low border border-outline-variant/50 text-on-surface font-body-lg text-body-lg rounded-lg px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none"
                />
              </div>

              <button
                type="button"
                className="w-full border-2 border-dashed border-primary/30 bg-primary/5 rounded-xl p-4 flex flex-col items-center justify-center gap-2 text-primary hover:bg-primary/10 transition-colors active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-[32px]">add_photo_alternate</span>
                <span className="font-label-md text-label-md">Ajouter une capture d&apos;écran</span>
              </button>

              <button
                type="submit"
                disabled={!canSubmit}
                className="btn-primary-gradient w-full bg-primary text-on-primary font-headline-sm text-headline-sm py-4 rounded-full shadow-[0_4px_14px_rgba(0,88,188,0.3)] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Envoyer le signalement
              </button>
            </form>
          </>
        )}
      </main>

      <BottomNav active="profile" />
    </div>
  );
}
