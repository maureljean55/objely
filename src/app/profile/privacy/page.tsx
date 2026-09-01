"use client";

import { useState } from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import Switch from "@/components/Switch";

export default function PrivacySecurityPage() {
  const [publicProfile, setPublicProfile] = useState(true);
  const [showPhoto, setShowPhoto] = useState(true);
  const [sharePersonalInfo, setSharePersonalInfo] = useState(false);
  const [locationPref, setLocationPref] = useState<"approx" | "precise" | "none">("approx");
  const [allowMessages, setAllowMessages] = useState(true);

  return (
    <div className="bg-background text-on-surface antialiased min-h-screen pb-32">
      <header className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-container-margin h-14 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/30">
        <Link href="/profile" aria-label="Retour" className="text-primary hover:opacity-70 transition-opacity active:scale-95 p-2 -ml-2 flex items-center justify-center">
          <span className="material-symbols-outlined">arrow_back_ios</span>
        </Link>
        <h1 className="font-headline-sm text-headline-sm text-primary absolute left-1/2 -translate-x-1/2">Confidentialité & Sécurité</h1>
        <div className="w-10" />
      </header>

      <main className="max-w-2xl mx-auto px-container-margin pt-20 pb-8 flex flex-col gap-lg">
        <section className="bg-surface-container-lowest rounded-xl soft-shadow p-4 flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-primary text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>shield_lock</span>
          </div>
          <div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">Vos données sont protégées</h3>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Objely protège vos informations personnelles. Vous contrôlez exactement ce que les autres utilisateurs peuvent voir sur la plateforme.
            </p>
          </div>
        </section>

        <section className="bg-surface-container-lowest rounded-xl soft-shadow overflow-hidden">
          <div className="px-4 py-3 bg-surface-container-low border-b border-outline-variant/30">
            <h3 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-on-surface-variant">visibility</span>
              Visibilité de mon profil
            </h3>
          </div>
          <div className="divide-y divide-outline-variant/30">
            <label className="flex justify-between items-center px-4 py-3 cursor-pointer">
              <span className="font-body-lg text-body-lg text-on-surface">Profil visible publiquement</span>
              <Switch checked={publicProfile} onChange={setPublicProfile} />
            </label>
            <label className="flex justify-between items-center px-4 py-3 cursor-pointer">
              <span className="font-body-lg text-body-lg text-on-surface">Afficher la photo de profil</span>
              <Switch checked={showPhoto} onChange={setShowPhoto} />
            </label>
            <label className="flex justify-between items-center px-4 py-3 cursor-pointer">
              <span className="font-body-lg text-body-lg text-on-surface">Partager les informations personnelles</span>
              <Switch checked={sharePersonalInfo} onChange={setSharePersonalInfo} />
            </label>
          </div>
        </section>

        <section className="bg-surface-container-lowest rounded-xl soft-shadow overflow-hidden">
          <div className="px-4 py-3 bg-surface-container-low border-b border-outline-variant/30">
            <h3 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-on-surface-variant">location_on</span>
              Localisation
            </h3>
          </div>
          <div className="flex flex-col p-4 gap-4">
            {[
              { id: "approx" as const, title: "Utiliser une localisation approximative", note: "Recommandé pour la confidentialité." },
              { id: "precise" as const, title: "Localisation précise", note: "Uniquement partagée lors d'un échange confirmé." },
              { id: "none" as const, title: "Ne pas autoriser la localisation", note: null },
            ].map((option) => (
              <label key={option.id} className="flex items-start gap-3 cursor-pointer">
                <span
                  onClick={() => setLocationPref(option.id)}
                  className={`mt-1 w-[22px] h-[22px] rounded-full border flex items-center justify-center shrink-0 ${
                    locationPref === option.id ? "border-primary-container" : "border-outline-variant"
                  }`}
                >
                  {locationPref === option.id && <span className="w-3 h-3 rounded-full bg-primary-container" />}
                </span>
                <div className="flex flex-col">
                  <span className="font-body-lg text-body-lg text-on-surface">{option.title}</span>
                  {option.note && <span className="font-label-md text-[11px] text-on-surface-variant">{option.note}</span>}
                </div>
              </label>
            ))}
          </div>
        </section>

        <section className="bg-surface-container-lowest rounded-xl soft-shadow overflow-hidden">
          <div className="px-4 py-3 bg-surface-container-low border-b border-outline-variant/30">
            <h3 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-on-surface-variant">chat</span>
              Messagerie
            </h3>
          </div>
          <div className="divide-y divide-outline-variant/30">
            <label className="flex justify-between items-center px-4 py-3 cursor-pointer">
              <span className="font-body-lg text-body-lg text-on-surface">Autoriser les messages</span>
              <Switch checked={allowMessages} onChange={setAllowMessages} />
            </label>
            <button className="w-full flex justify-between items-center px-4 py-3 hover:bg-surface-container-low transition-colors">
              <span className="font-body-lg text-body-lg text-on-surface">Bloquer des utilisateurs</span>
              <span className="material-symbols-outlined text-outline">chevron_right</span>
            </button>
          </div>
        </section>

        <section className="bg-surface-container-lowest rounded-xl soft-shadow overflow-hidden">
          <div className="px-4 py-3 bg-surface-container-low border-b border-outline-variant/30">
            <h3 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-on-surface-variant">manage_accounts</span>
              Compte et sécurité
            </h3>
          </div>
          <div className="divide-y divide-outline-variant/30">
            {[
              { icon: "key", label: "Modifier le mot de passe" },
              { icon: "devices", label: "Appareils connectés" },
              { icon: "history", label: "Sessions actives" },
            ].map((item) => (
              <button key={item.label} className="w-full flex justify-between items-center px-4 py-3 hover:bg-surface-container-low transition-colors">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-outline">{item.icon}</span>
                  <span className="font-body-lg text-body-lg text-on-surface">{item.label}</span>
                </div>
                <span className="material-symbols-outlined text-outline">chevron_right</span>
              </button>
            ))}
          </div>
        </section>

        <div className="mt-2 mb-4 flex items-center justify-center gap-1 text-center">
          <span className="material-symbols-outlined text-outline text-[16px]">info</span>
          <p className="font-label-md text-[11px] text-outline">Votre adresse personnelle et vos informations sensibles ne sont jamais affichées publiquement.</p>
        </div>
      </main>

      <BottomNav active="profile" />
    </div>
  );
}
