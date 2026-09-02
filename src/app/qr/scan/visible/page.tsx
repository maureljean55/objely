"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

const AVATAR =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuA-YkVROoSjSy56azjor4JSQuGiaGGJlTajtNJ1zO1MSGovIQTNN2iFZK44kTdqqvwRO3dtv7jkqtuj4cTM8Yhz6oXtlTS0bpKIHkudT_5R1Gy8GqLitdsNZDaWQoWXeLtC7_SC8dzfCl7ezXXLi5z6kFrxl9-An69QzjQoygkyu1fqRDA-c8INlaiMfjLPjRDeaXK1-Pkb5IBPSnrBN9LTFG5qApg7MPrPvOZTAsRO90WoR5yruJL5";

export default function QrScanVisiblePage() {
  const router = useRouter();

  return (
    <div className="bg-background text-on-background font-body-md antialiased min-h-screen flex flex-col">
      <header className="glass-header fixed top-0 inset-x-0 z-50 flex items-center px-container-margin h-14 w-full shadow-[0_1px_0_rgba(0,0,0,0.05)]">
        <button type="button" onClick={() => router.back()} aria-label="Retour" className="w-10 h-10 flex items-center justify-center rounded-full text-primary hover:bg-surface-container-high/50 transition-colors -ml-2">
          <span className="material-symbols-outlined">arrow_back_ios</span>
        </button>
        <h1 className="font-headline-sm text-headline-sm text-on-surface flex-1 text-center truncate px-2">QR Code Objely détecté</h1>
        <div className="w-10 h-10" />
      </header>

      <main className="flex-1 w-full max-w-md mx-auto pt-[104px] px-container-margin flex flex-col items-center">
        <div className="flex flex-col items-center mt-lg mb-xl">
          <div className="relative mb-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt="Thomas Martin" className="w-32 h-32 rounded-full object-cover border-4 border-surface shadow-sm bg-surface-container-high" src={AVATAR} />
            <div className="absolute bottom-0 right-0 bg-primary text-on-primary rounded-full p-1.5 shadow-md border-2 border-surface">
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            </div>
          </div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface text-center mb-2">Thomas Martin</h2>
          <div className="inline-flex items-center gap-1.5 bg-surface-container-high px-3 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-body-md text-body-md text-[13px] text-on-surface-variant">Utilisateur Objely</span>
          </div>
        </div>

        <div className="w-full bg-surface-container-lowest rounded-2xl p-lg mb-xl soft-shadow flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-primary-container/10 text-primary-container flex items-center justify-center mb-md">
            <span className="material-symbols-outlined text-2xl">lock_open</span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant mb-lg max-w-xs">
            Cette personne a choisi de partager son numéro avec vous.
          </p>
          <div className="bg-surface-container-low px-lg py-md rounded-xl w-full border border-outline-variant/30 flex items-center justify-center gap-3">
            <span className="material-symbols-outlined text-on-surface-variant">phone_iphone</span>
            <span className="font-headline-lg text-headline-lg text-on-surface tracking-widest">06 12 34 56 78</span>
          </div>
        </div>

        <div className="w-full flex flex-col gap-sm mt-auto mb-xl">
          <a
            href="tel:0612345678"
            className="w-full h-[50px] bg-primary text-on-primary font-headline-sm text-headline-sm rounded-xl shadow-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          >
            <span className="material-symbols-outlined">call</span>
            Appeler
          </a>
          <Link
            href="/chat"
            className="w-full h-[50px] bg-primary/5 text-primary font-headline-sm text-headline-sm rounded-xl flex items-center justify-center gap-2 active:bg-primary/10 transition-colors"
          >
            <span className="material-symbols-outlined">chat_bubble</span>
            Envoyer un message
          </Link>
        </div>
      </main>
    </div>
  );
}
