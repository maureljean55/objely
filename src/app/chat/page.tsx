"use client";

import { useRef, useState } from "react";
import Link from "next/link";

const AVATAR =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAHIRJ2LimYBXyVxFqgSdPjbDpdtNWzzGRXKRClA4UB47l_yxsN7GW8FUNX_H27eXniyu0TtRoE_Pu8tjMqnWXOxLQeeeiGd3KhoTBv4gIX996LHAcP180S1nje4jbcjHY7LhlZ0FDgaK3d2h3aGEO0V_TMDP1lLus-2X94eVwL_v2sIskHfxD3ZOPjQFzkKVgCpR124pGodHTsrUBdZAOZVGUq6vt8eSuNGKYilzkPVjCC3vvbqVhb";

export default function SecureChatPage() {
  const [draft, setDraft] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  return (
    <div className="bg-background text-on-background font-body-md antialiased">
      <header className="glass-header fixed top-0 inset-x-0 z-50 flex justify-between items-center w-full px-container-margin py-base shadow-[0_1px_0_rgba(0,0,0,0.05)]">
        <Link href="/matching" className="text-primary p-2 -ml-2 rounded-full hover:bg-surface-container-high/50 transition-colors flex items-center">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>arrow_back_ios</span>
          <span className="font-label-md text-label-md ml-1">Retour</span>
        </Link>
        <div className="flex flex-col items-center">
          <h1 className="font-headline-sm text-headline-sm text-on-surface">Sac à dos noir</h1>
          <p className="font-label-md text-label-md text-outline">Trouvé par Jean D.</p>
        </div>
        <button className="text-primary p-2 -mr-2 rounded-full hover:bg-surface-container-high/50 transition-colors">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>more_horiz</span>
        </button>
      </header>

      <main className="min-h-screen px-container-margin py-md pt-[92px] pb-[120px] flex flex-col gap-md">
        <div className="bg-surface-container-high rounded-xl p-3 flex items-start gap-3 shadow-sm mx-auto max-w-sm mt-2 mb-4">
          <span className="material-symbols-outlined text-tertiary mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>security</span>
          <p className="font-label-md text-label-md text-on-surface-variant flex-1">
            Pour votre sécurité, <strong className="text-on-surface">ne partagez pas votre adresse personnelle</strong>. Privilégiez un lieu public pour la remise de l&apos;objet.
          </p>
        </div>

        <div className="text-center">
          <span className="font-label-md text-label-md text-outline bg-surface-container px-3 py-1 rounded-full">Aujourd&apos;hui, 10:42</span>
        </div>

        <div className="flex gap-2 max-w-[85%] self-start">
          <div className="w-8 h-8 rounded-full bg-surface-container-highest overflow-hidden shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="w-full h-full object-cover" alt="Jean D." src={AVATAR} />
          </div>
          <div className="bg-surface-container rounded-2xl message-in px-4 py-2.5 text-on-surface shadow-sm">
            <p className="font-body-md text-body-md">Bonjour ! J&apos;ai trouvé votre sac à dos près du café de la gare.</p>
          </div>
        </div>

        <div className="flex gap-2 max-w-[85%] self-end flex-row-reverse">
          <div className="w-8 h-8 rounded-full bg-primary overflow-hidden shrink-0 flex items-center justify-center text-on-primary">
            <span className="font-label-md text-label-md">Moi</span>
          </div>
          <div className="rounded-2xl message-out px-4 py-2.5 text-on-primary shadow-sm text-right">
            <p className="font-body-md text-body-md">Oh merci beaucoup ! J&apos;étais tellement inquiet. Êtes-vous encore dans les parages ?</p>
          </div>
        </div>

        <div className="flex gap-2 max-w-[85%] self-start">
          <div className="w-8 h-8 rounded-full bg-surface-container-highest overflow-hidden shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="w-full h-full object-cover" alt="Jean D." src={AVATAR} />
          </div>
          <div className="bg-surface-container rounded-2xl message-in px-4 py-2.5 text-on-surface shadow-sm">
            <p className="font-body-md text-body-md">Je viens de partir, mais je travaille à côté. On peut se voir à midi devant la boulangerie sur la place centrale ?</p>
          </div>
        </div>
        <div className="flex gap-2 max-w-[85%] self-start ml-10 -mt-2">
          <div className="bg-surface-container rounded-2xl px-4 py-2.5 text-on-surface shadow-sm message-in">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="rounded-lg w-48 h-auto object-cover border border-outline-variant/20 mb-2"
              alt="Photo du sac à dos noir trouvé"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDRzca4SM0oTU04n-flNmzZTi3eC5L-UsE-MCYGLE6bcr61y1yDe8lWAgibe3yfmm9pieJEe6FBlUmFIDdU3wH1m_WQQXqb4W_8XRv310t6ouy_jUGWM6Hdg453dmMfrwzAGasg6zv6BgjfrVeQMwkpDR7OD5ePwIUq2y7Kr0uKCJa2G6k8FoWmr3SC_cIUNg9kP3KwOvnFGzuiQjBkXyyJZs98piWbGU_POL6dtjdiRMIt1wMc1H__"
            />
            <p className="font-body-md text-body-md">C&apos;est bien celui-ci ?</p>
          </div>
        </div>
      </main>

      <footer className="glass-input fixed bottom-0 inset-x-0 z-50 p-3 safe-area-pb">
        <div className="flex items-end gap-2 max-w-7xl mx-auto w-full">
          <button className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors shrink-0">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>add_photo_alternate</span>
          </button>
          <div className="flex-1 bg-surface-container-low rounded-xl border border-outline-variant/30 px-4 py-2 flex items-center min-h-[44px]">
            <textarea
              ref={textareaRef}
              className="w-full bg-transparent border-none p-0 focus:ring-0 resize-none font-body-md text-body-md text-on-surface placeholder-outline max-h-32"
              placeholder="Message..."
              rows={1}
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value);
                const el = textareaRef.current;
                if (el) {
                  el.style.height = "0px";
                  el.style.height = `${el.scrollHeight}px`;
                }
              }}
            />
          </div>
          <button className="p-2 bg-primary text-on-primary rounded-full hover:opacity-90 transition-opacity shrink-0 shadow-sm flex items-center justify-center h-11 w-11">
            <span className="material-symbols-outlined ml-1" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
