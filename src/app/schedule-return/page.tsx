"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const LOCATIONS = [
  {
    id: "gare-du-nord",
    name: "Gare du Nord",
    description: "Devant l'entrée principale, point de rencontre sécurisé.",
    icon: "train",
    tag: "Point de transit",
  },
  {
    id: "cafe-de-la-paix",
    name: "Café de la Paix",
    description: "Place de l'Opéra. Lieu public très fréquenté.",
    icon: "local_cafe",
    tag: "Établissement public",
  },
];

const TIME_SLOTS = ["10:00 - 11:00", "12:00 - 13:00", "14:00 - 15:00", "17:30 - 18:30"];

export default function ScheduleReturnPage() {
  const router = useRouter();
  const [location, setLocation] = useState(LOCATIONS[0].id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleConfirm = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);
    }, 1000);
  };

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen overflow-x-hidden">
      <header className="md:hidden flex justify-between items-center w-full px-container-margin py-base bg-background/80 backdrop-blur-md top-0 z-50 sticky">
        <Link href="/chat" className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-low hover:bg-surface-container-high transition-colors">
          <span className="material-symbols-outlined text-on-surface-variant">arrow_back</span>
        </Link>
        <h1 className="font-headline-md text-headline-md text-primary">Organiser la restitution</h1>
        <div className="w-10" />
      </header>
      <header className="hidden md:flex justify-between items-center w-full px-container-margin py-base max-w-7xl mx-auto bg-background/80 backdrop-blur-md top-0 z-50 sticky mb-8">
        <div className="flex items-center gap-4">
          <Link href="/chat" className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-low hover:bg-surface-container-high transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant">arrow_back</span>
          </Link>
          <span className="font-display text-display text-primary">Objely</span>
        </div>
        <div className="w-10 h-10 rounded-full bg-surface-container-highest overflow-hidden" />
      </header>

      <main className="max-w-7xl mx-auto px-container-margin md:px-lg pb-32 md:pb-16 pt-4 md:pt-0">
        <div className="hidden md:block mb-10 text-center">
          <h1 className="font-display text-display text-on-background mb-2">Organiser la restitution</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
            Veuillez sélectionner un lieu public, une date et une heure pour récupérer votre objet en toute sécurité.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg items-start">
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-lg">
            <section className="bg-surface-container-lowest rounded bloom-shadow inner-stroke p-md md:p-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
                </div>
                <h2 className="font-headline-md text-headline-md text-on-background">Lieu de rencontre</h2>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant mb-4">Lieux publics recommandés pour la sécurité des deux parties.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {LOCATIONS.map((loc) => {
                  const isChecked = location === loc.id;
                  return (
                    <label key={loc.id} className="cursor-pointer">
                      <input
                        checked={isChecked}
                        onChange={() => setLocation(loc.id)}
                        className="peer sr-only"
                        name="location"
                        type="radio"
                      />
                      <div
                        className={`p-4 rounded-xl border transition-colors h-full hover:bg-surface-container-low ${
                          isChecked ? "border-primary bg-primary-fixed/30" : "border-outline-variant"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-headline-sm text-headline-sm text-on-surface">{loc.name}</h3>
                          <span className={`material-symbols-outlined text-primary transition-opacity ${isChecked ? "opacity-100" : "opacity-0"}`}>
                            check_circle
                          </span>
                        </div>
                        <p className="font-body-md text-body-md text-on-surface-variant mb-2">{loc.description}</p>
                        <div className="flex items-center gap-1 text-on-surface-variant">
                          <span className="material-symbols-outlined text-[16px]">{loc.icon}</span>
                          <span className="font-label-md text-label-md">{loc.tag}</span>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </section>

            <section className="bg-surface-container-lowest rounded bloom-shadow inner-stroke p-md md:p-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>calendar_month</span>
                </div>
                <h2 className="font-headline-md text-headline-md text-on-background">Date et Heure</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                <div>
                  <label className="block font-label-md text-label-md text-on-surface mb-2" htmlFor="return-date">
                    Date de la rencontre
                  </label>
                  <input
                    id="return-date"
                    className="w-full bg-surface-container-low border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 font-body-md text-body-md text-on-surface transition-all outline-none"
                    type="date"
                    defaultValue="2026-09-08"
                  />
                </div>
                <div className="relative">
                  <label className="block font-label-md text-label-md text-on-surface mb-2" htmlFor="return-time">
                    Heure suggérée
                  </label>
                  <select
                    id="return-time"
                    defaultValue={TIME_SLOTS[2]}
                    className="w-full bg-surface-container-low border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 font-body-md text-body-md text-on-surface transition-all outline-none appearance-none"
                  >
                    {TIME_SLOTS.map((slot) => (
                      <option key={slot}>{slot}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-on-surface-variant mt-7">
                    <span className="material-symbols-outlined">expand_more</span>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-surface-container-lowest rounded bloom-shadow inner-stroke p-md md:p-lg mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>chat</span>
                </div>
                <h2 className="font-headline-md text-headline-md text-on-background">Message au trouveur (Optionnel)</h2>
              </div>
              <textarea
                className="w-full bg-surface-container-low border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 font-body-md text-body-md text-on-surface transition-all outline-none resize-none min-h-[120px]"
                placeholder="Précisez comment vous reconnaître (ex: 'Je porterai un manteau rouge') ou ajoutez une note de remerciement..."
              />
            </section>

            <div className="flex justify-end gap-4 mt-4">
              <Link href="/chat" className="px-6 py-4 rounded-xl font-headline-sm text-headline-sm text-primary hover:bg-surface-container-low transition-colors">
                Annuler
              </Link>
              <button
                onClick={handleConfirm}
                disabled={isSubmitting}
                className="btn-gradient px-8 py-4 rounded-xl bg-primary text-on-primary font-headline-sm text-headline-sm shadow-md hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-70"
              >
                {isSubmitting ? (
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                ) : (
                  "Confirmer la rencontre"
                )}
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 xl:col-span-4 relative">
            <aside className="sticky top-[100px] bg-surface-container-lowest rounded bloom-shadow inner-stroke overflow-hidden flex flex-col">
              <div className="h-48 relative overflow-hidden bg-surface-container-low">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="Portefeuille noir trouvé"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDdwifSzMCEFvdPpJKTdvUtnCmzNv8RDqLrvxVxCn3p5655mkBjZ-oTo2FAFQBhuyph_IddLIHFTepe7xG8ujAuaTxqV23lyd0sobMNC2pCZwk0mxzjIEwVVOMifjWJyeUnNezOozpZz6VF2uBbo_UxqmQwBoCtbN7PJxOS8fnBHGYn2bYvVhl7zKoaSEVqjaQAKKiboj-SZBPIMby1NkEywMCdUuPaodFKVZ-LlKG_qNZRL8_pJxlM"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full border border-black/5 flex items-center gap-1.5 shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-label-md text-label-md text-on-surface">Trouvé</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-headline-md text-headline-md text-on-background mb-1">Portefeuille Noir</h3>
                <p className="font-body-md text-body-md text-on-surface-variant mb-6">Perdu le 15 Nov, ligne 4</p>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-outline-variant/30">
                    <span className="font-body-md text-body-md text-on-surface-variant">Statut</span>
                    <span className="font-headline-sm text-headline-sm text-on-background">En attente de rencontre</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-outline-variant/30">
                    <span className="font-body-md text-body-md text-on-surface-variant">Frais de plateforme</span>
                    <span className="font-headline-sm text-headline-sm text-on-background">0.00 €</span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      {showSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 glass-panel transition-opacity duration-500">
          <div className="bg-surface-container-lowest p-8 md:p-12 rounded-xl bloom-shadow inner-stroke max-w-lg w-full text-center transition-transform duration-500 flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center mb-6 relative">
              <span className="material-symbols-outlined text-[48px] text-emerald-600" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <span className="material-symbols-outlined absolute -top-2 -right-2 text-emerald-400 text-2xl animate-bounce">auto_awesome</span>
              <span className="material-symbols-outlined absolute top-10 -left-4 text-emerald-400 text-xl animate-pulse">auto_awesome</span>
            </div>
            <h2 className="font-display text-display text-on-background mb-4">🎉 Objet retrouvé !</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant mb-8">
              Votre objet est de nouveau avec vous. Les détails de la rencontre ont été confirmés et envoyés au trouveur.
            </p>
            <button
              onClick={() => router.push("/")}
              className="w-full py-4 rounded-xl bg-emerald-600 text-white font-headline-sm text-headline-sm shadow-md hover:bg-emerald-700 transition-colors"
            >
              Retour à l&apos;accueil
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
