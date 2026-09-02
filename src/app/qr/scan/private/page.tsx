"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

const AVATAR =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAvhnn2hrpPhzVL_CXtKwXnyn3K3UvW01azynM8GnmFZJNnIxPjZt5-tGwqXj27bNmVJNheXhr-44GyDhyig2IALCsESxtucm1NSdfgT2hjF642lr_8Ijtrfde4jAjD1AaJyADcinBXGqdSUpqV3qctx6Re66TO7_2tuBeIsSp_NSqEz5vn-TA-rmLs81otIlupnTOHePwo27rItVs_l1SwIzu_aaPZFyxJYNKL4C3jG3W3yIH64eBY";

export default function QrScanPrivatePage() {
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

      <main className="w-full max-w-md mx-auto pt-[104px] px-container-margin pb-xl flex-1 flex flex-col gap-md">
        <div className="bg-primary/5 rounded-xl soft-shadow p-lg flex flex-col items-center text-center gap-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="Profil scanné" className="w-24 h-24 rounded-full object-cover border-4 border-surface shadow-sm mb-2" src={AVATAR} />
          <h1 className="font-headline-md text-headline-md text-on-surface">Thomas Martin</h1>
          <div className="flex items-center gap-1.5 text-primary bg-primary/10 px-3 py-1 rounded-full">
            <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            <span className="font-body-md text-body-md text-[13px]">Utilisateur Objely</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl soft-shadow p-md flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-surface-variant flex items-center justify-center text-on-surface-variant shrink-0">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
          </div>
          <div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Numéro privé</h2>
            <p className="font-body-md text-body-md text-[13px] text-on-surface-variant mt-0.5">
              Cette personne n&apos;a pas autorisé l&apos;affichage de son numéro lors du scan.
            </p>
          </div>
        </div>

        <Link
          href="/chat"
          className="w-full bg-primary text-on-primary font-headline-sm text-headline-sm rounded-xl py-3.5 px-4 flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition-transform mt-2"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>chat</span>
          Contacter sur Objely
        </Link>
      </main>
    </div>
  );
}
