"use client";

import { useState } from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";

type Tab = "perdus" | "trouves" | "retrouves";

const TABS: { id: Tab; label: string }[] = [
  { id: "perdus", label: "Perdus" },
  { id: "trouves", label: "Trouvés" },
  { id: "retrouves", label: "Retrouvés" },
];

export default function MyItemsPage() {
  const [tab, setTab] = useState<Tab>("perdus");
  const activeIndex = TABS.findIndex((t) => t.id === tab);

  return (
    <div className="bg-background text-on-surface antialiased min-h-screen pb-32">
      <header className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-container-margin h-14 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/30">
        <Link href="/profile" aria-label="Retour" className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:opacity-70 transition-opacity active:scale-95">
          <span className="material-symbols-outlined">arrow_back_ios</span>
        </Link>
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-primary absolute left-1/2 -translate-x-1/2">Mes objets</h1>
        <Link href="/profile/settings" aria-label="Paramètres" className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:opacity-70 transition-opacity active:scale-95">
          <span className="material-symbols-outlined">settings</span>
        </Link>
      </header>

      <main className="pt-20 px-container-margin flex flex-col gap-lg max-w-2xl mx-auto">
        <div className="bg-surface-container-high rounded-full p-1 flex relative">
          <div
            className="absolute inset-y-1 left-1 w-[calc(33.33%-4px)] bg-surface-container-lowest rounded-full shadow-sm transition-transform duration-300 ease-in-out"
            style={{ transform: `translateX(${activeIndex * 100}%)` }}
          />
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`relative z-10 flex-1 py-2 font-label-md text-label-md text-center rounded-full transition-colors ${
                tab === t.id ? "text-on-surface" : "text-on-surface-variant"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "perdus" && (
          <div className="flex flex-col gap-md">
            <Link href="/matching" className="bg-surface-container-lowest rounded-[20px] soft-shadow overflow-hidden block">
              <div className="h-32 bg-surface-container w-full relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="w-full h-full object-cover"
                  alt="iPhone 14 Pro"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDcKlnzfvaN-bmeuUIGJ4gfRF2ko9IvqtgDqtgdYkukq_BDKZFzXLxulEcuYXV1uhmP-PsSG0byBv4dxCPU5alrDsE7J2eVzRGXpQk8MVoRdo-vRhfWbNSFrvVqgViJTsa6T8mQvVRjNkmobZ8V7D9tRwz8IxlkQE6OgEjxpTd4-Urlfx01o0aeIadJDQEYUPyI_WQ4Zian0mW4_5w-pN4eOWdUyZjNnHBhzM11Zka02iKlUM1y2qru"
                />
                <div className="absolute top-2 right-2 bg-surface/90 backdrop-blur-md px-3 py-1 rounded-full shadow-sm">
                  <span className="font-label-md text-[11px] text-primary flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">radar</span>
                    Recherche active
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h2 className="font-headline-sm text-headline-sm text-on-surface">iPhone 14 Pro</h2>
                <p className="font-body-md text-body-md text-on-surface-variant">Électronique</p>
                <div className="flex flex-col gap-1 mt-3 pt-3 border-t border-outline-variant/30 font-body-md text-body-md text-on-surface-variant">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                    <span>Perdu le 12 oct.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">location_on</span>
                    <span>Paris 15e</span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        {tab === "trouves" && (
          <div className="flex flex-col items-center justify-center py-xl text-center">
            <div className="w-32 h-32 mb-lg bg-surface-container-low rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[56px]">search_off</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">Vous n&apos;avez aucun objet trouvé</h3>
            <p className="font-body-md text-body-md text-on-surface-variant mb-lg px-6 max-w-sm">
              Si vous avez trouvé un objet qui ne vous appartient pas, déclarez-le ici pour aider son propriétaire à le retrouver.
            </p>
            <Link
              href="/report-lost"
              className="bg-primary text-on-primary py-3 px-8 rounded-full font-body-lg text-body-lg font-semibold hover:opacity-90 active:scale-95 transition-all shadow-md"
            >
              Déclarer un objet
            </Link>
          </div>
        )}

        {tab === "retrouves" && (
          <div className="flex flex-col gap-md">
            <Link href="/schedule-return" className="bg-surface-container-lowest rounded-[20px] soft-shadow overflow-hidden p-4 flex items-start gap-4 block">
              <div className="w-20 h-20 bg-surface-container rounded-xl overflow-hidden shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="w-full h-full object-cover"
                  alt="Portefeuille noir"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDdwifSzMCEFvdPpJKTdvUtnCmzNv8RDqLrvxVxCn3p5655mkBjZ-oTo2FAFQBhuyph_IddLIHFTepe7xG8ujAuaTxqV23lyd0sobMNC2pCZwk0mxzjIEwVVOMifjWJyeUnNezOozpZz6VF2uBbo_UxqmQwBoCtbN7PJxOS8fnBHGYn2bYvVhl7zKoaSEVqjaQAKKiboj-SZBPIMby1NkEywMCdUuPaodFKVZ-LlKG_qNZRL8_pJxlM"
                />
              </div>
              <div className="flex-1">
                <h2 className="font-headline-sm text-headline-sm text-on-surface">Portefeuille noir</h2>
                <div className="mt-2 flex flex-col gap-1 font-label-md text-[11px] text-on-surface-variant">
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                    <span>Trouvé le 10 oct.</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">location_on</span>
                    <span>Gare du Nord</span>
                  </div>
                </div>
                <div className="mt-3 inline-flex items-center gap-1 bg-[#E8F5E9] text-[#2E7D32] px-2 py-1 rounded-md">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span>
                  <span className="font-label-md text-[11px] font-medium">Objet retrouvé</span>
                </div>
              </div>
            </Link>
          </div>
        )}
      </main>

      <BottomNav active="profile" />
    </div>
  );
}
