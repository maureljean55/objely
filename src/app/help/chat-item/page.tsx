"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function HelpChatItemPage() {
  const router = useRouter();
  const [resolved, setResolved] = useState<boolean | null>(null);

  return (
    <div className="bg-background min-h-screen flex flex-col font-body-md antialiased text-on-surface">
      <header className="glass-header fixed top-0 inset-x-0 z-50 shadow-sm">
        <div className="max-w-[800px] mx-auto flex items-center justify-between px-container-margin h-14 w-full">
          <Link href="/help/history" className="text-primary hover:opacity-70 transition-opacity active:scale-95 flex items-center justify-center p-2 -ml-2 rounded-full">
            <span className="material-symbols-outlined">arrow_back_ios</span>
          </Link>
          <h1 className="font-headline-sm text-headline-sm text-on-surface text-center flex-1">Support</h1>
          <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-outline-variant/20 bg-surface-variant">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="Agent support"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCOkLbMjZABwUcH9BtuJ3mYP3_RUiZAWK5Xg92eo7IApjEzPl5sN-yVZLazWlL-Gkrf-6shicIhtWuExF-aqQOYlPmwWOGCZblxSO90_MP3xfEKU2K5lkRHg0thGOhh2eApeWBYPjxiW2x5vt0MKc-Fsl0J-oIkNKcrioEsE56L_1SAwRHuOozd5RWHAh6tdjmJa7kfZh-qf0yOLKDEvxksljtraOUQ4GKfb5ydv4oU9vLVwUeNqrs4"
            />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-[800px] w-full mx-auto flex flex-col px-container-margin pt-[76px] pb-[140px]">
        {/* Item context card */}
        <div className="bg-surface-container-lowest rounded-xl p-md flex items-center justify-between shadow-sm mb-lg border border-outline-variant/30">
          <div className="flex items-center gap-md">
            <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-outline" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <p className="font-label-md text-[11px] text-outline uppercase tracking-wider">Objet concerné</p>
              <p className="font-body-md text-body-md text-on-surface font-semibold leading-tight">Portefeuille noir</p>
              <p className="font-label-md text-[11px] text-outline-variant">(Déclaré le 12 octobre)</p>
            </div>
          </div>
          <Link
            href="/matching"
            className="font-label-md text-label-md text-primary font-semibold px-md py-2 rounded-full bg-primary/5 hover:bg-primary/10 transition-colors shrink-0 whitespace-nowrap"
          >
            Voir l&apos;objet
          </Link>
        </div>

        <div className="flex flex-col gap-lg">
          <div className="text-center">
            <span className="font-label-md text-[11px] text-outline-variant uppercase tracking-wider">Aujourd&apos;hui 14:22</span>
          </div>

          <div className="flex items-end gap-2 max-w-[85%]">
            <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 bg-surface-variant flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>support_agent</span>
            </div>
            <div className="bg-surface-container rounded-2xl message-in px-4 py-2.5 text-on-surface shadow-sm">
              <p className="font-body-md text-body-md">Bonjour ! Je suis là pour vous aider à retrouver votre portefeuille. Pourriez-vous me confirmer s&apos;il contient des documents d&apos;identité ?</p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1 self-end max-w-[85%]">
            <div className="rounded-2xl message-out p-1 shadow-sm overflow-hidden w-full max-w-[280px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt="Portefeuille noir déclaré"
                className="w-full h-[180px] object-cover rounded-xl"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAsx7oSeLX5Z95RCSoBH-pUJRFpVk3A8Xq8-H4tgwBo89m_kuqN0ZSF8GqTtoqVhRGbjCORX09HfwqWEQk3JYiz2IEZWjsGSNSB0B0qd6qvDSmsnHBtyFtPWOQi1yoaiPOVuE8-1K10XJhdVAwVmn2eR3tBPoM7SI4mJGTYfCbKysSZddjLADa0wYd6yveYr_RzUqO4xrAZZgltvgy_PLpaKSoGY7TnTXwHl-IOmSCGvVUPsRgnVkvK"
              />
            </div>
            <div className="rounded-2xl message-out px-4 py-2.5 text-on-primary shadow-sm">
              <p className="font-body-md text-body-md">Oui, voici à quoi il ressemble. Il y a ma carte d&apos;identité à l&apos;intérieur.</p>
            </div>
            <span className="font-label-md text-[11px] text-outline-variant mr-2">14:25 • Lu</span>
          </div>

          <div className="flex items-center gap-2 max-w-[85%]">
            <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 bg-surface-variant opacity-50 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[18px]">support_agent</span>
            </div>
            <div className="flex flex-col gap-1">
              <p className="font-label-md text-[11px] text-outline-variant pl-1">Support Objely est en train d&apos;écrire...</p>
              <div className="bg-surface-container rounded-full px-4 py-3 flex items-center gap-1 w-fit">
                <div className="w-1.5 h-1.5 bg-outline rounded-full animate-bounce" style={{ animationDelay: "-0.32s" }} />
                <div className="w-1.5 h-1.5 bg-outline rounded-full animate-bounce" style={{ animationDelay: "-0.16s" }} />
                <div className="w-1.5 h-1.5 bg-outline rounded-full animate-bounce" />
              </div>
            </div>
          </div>

          {/* Resolution prompt */}
          <div className="w-full mt-md flex justify-center">
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-lg flex flex-col items-center gap-md shadow-sm w-full max-w-[400px]">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-[24px]">task_alt</span>
              </div>
              <p className="font-headline-sm text-headline-sm text-on-surface text-center">Cette conversation est-elle résolue ?</p>
              {resolved === null ? (
                <div className="flex flex-col w-full gap-2">
                  <button
                    onClick={() => {
                      setResolved(true);
                      setTimeout(() => router.push("/help/history"), 900);
                    }}
                    className="w-full bg-primary text-on-primary font-body-md text-body-md font-semibold py-2.5 rounded-full hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    Oui, merci <span className="material-symbols-outlined text-[18px]">check</span>
                  </button>
                  <button
                    onClick={() => setResolved(false)}
                    className="w-full bg-surface-container text-on-surface font-body-md text-body-md font-medium py-2.5 rounded-full hover:bg-surface-container-high active:scale-[0.98] transition-all"
                  >
                    Non, j&apos;ai encore besoin d&apos;aide
                  </button>
                </div>
              ) : resolved ? (
                <p className="font-body-md text-body-md text-emerald-600 font-medium">Merci ! Retour à l&apos;historique...</p>
              ) : (
                <p className="font-body-md text-body-md text-on-surface-variant">D&apos;accord, continuez à décrire votre problème ci-dessous.</p>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="glass-input fixed bottom-0 inset-x-0 z-40 safe-area-pb">
        <div className="max-w-[800px] mx-auto flex items-end gap-2 p-3">
          <button className="w-10 h-10 rounded-full flex items-center justify-center text-primary shrink-0 hover:bg-primary/10 transition-colors">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>add_circle</span>
          </button>
          <div className="flex-1 bg-surface-container-low rounded-3xl border border-outline-variant/30 px-4 py-2 flex items-center min-h-[44px]">
            <input
              className="w-full bg-transparent border-none p-0 focus:ring-0 font-body-md text-body-md text-on-surface placeholder:text-outline/70"
              placeholder="Écrivez un message..."
              type="text"
            />
          </div>
          <button className="w-10 h-10 rounded-full flex items-center justify-center bg-primary text-on-primary shrink-0 hover:opacity-90 transition-opacity shadow-sm">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
