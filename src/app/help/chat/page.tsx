"use client";

import { useRef, useState } from "react";
import Link from "next/link";

const SUGGESTIONS = [
  { icon: "search", label: "Problème avec une correspondance" },
  { icon: "package_2", label: "Problème avec un objet" },
];

export default function HelpChatPage() {
  const [draft, setDraft] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  return (
    <div className="bg-background text-on-background font-body-md antialiased">
      <header className="glass-header fixed top-0 inset-x-0 z-50 flex items-center justify-between px-container-margin h-14 shadow-sm">
        <Link href="/help" className="text-primary hover:opacity-70 transition-opacity active:scale-95 flex items-center justify-center w-10 h-10 -ml-2 rounded-full">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>arrow_back_ios</span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-variant flex items-center justify-center text-primary">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>support_agent</span>
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-surface rounded-full" />
          </div>
          <div className="flex flex-col">
            <h1 className="font-headline-sm text-headline-sm text-on-surface">Service client</h1>
            <span className="font-label-md text-[11px] text-outline">Répond généralement en quelques minutes</span>
          </div>
        </div>
        <button className="text-on-surface-variant hover:opacity-70 transition-opacity active:scale-95 w-10 h-10 flex items-center justify-center">
          <span className="material-symbols-outlined">more_vert</span>
        </button>
      </header>

      <main className="min-h-screen max-w-[800px] mx-auto px-container-margin py-md pt-[92px] pb-[140px] flex flex-col gap-md">
        <div className="text-center">
          <span className="font-label-md text-[11px] text-outline-variant uppercase tracking-wider">Aujourd&apos;hui, 10:42</span>
        </div>

        <div className="flex flex-col items-start gap-1 max-w-[85%]">
          <div className="bg-surface-container rounded-2xl message-in px-4 py-2.5 text-on-surface shadow-sm">
            <p className="font-body-md text-body-md">Bonjour 👋 Comment pouvons-nous vous aider aujourd&apos;hui ?</p>
          </div>
          <span className="font-label-md text-[11px] text-outline-variant ml-2">10:42</span>
        </div>

        <div className="flex flex-col items-end self-end gap-1 max-w-[85%]">
          <div className="rounded-2xl message-out px-4 py-2.5 text-on-primary shadow-sm">
            <p className="font-body-md text-body-md">Bonjour, j&apos;ai perdu mon portefeuille et j&apos;ai trouvé une correspondance.</p>
          </div>
          <div className="flex items-center gap-1 mr-2">
            <span className="font-label-md text-[11px] text-outline-variant">10:45</span>
            <span className="font-label-md text-[11px] text-primary">Vu</span>
            <span className="material-symbols-outlined text-[14px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>done_all</span>
          </div>
        </div>

        <div className="flex flex-col items-start gap-1 max-w-[85%]">
          <div className="bg-surface-container rounded-2xl px-4 py-2.5 text-on-surface shadow-sm">
            <p className="font-body-md text-body-md">Pas d&apos;inquiétude. Nous allons vous aider à vérifier la correspondance et à organiser la restitution.</p>
          </div>
          <div className="bg-surface-container rounded-2xl message-in px-4 py-2.5 text-on-surface shadow-sm">
            <p className="font-body-md text-body-md">Pouvez-vous nous préciser le problème que vous rencontrez ?</p>
          </div>
          <span className="font-label-md text-[11px] text-outline-variant ml-2">10:46</span>
        </div>

        <div className="flex flex-col gap-2 items-start">
          {SUGGESTIONS.map((s) => (
            <button
              key={s.label}
              onClick={() => setDraft(s.label)}
              className="bg-surface-container-lowest text-primary border border-outline-variant/40 rounded-full px-4 py-2 flex items-center gap-2 hover:bg-primary/5 active:scale-95 transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">{s.icon}</span>
              <span className="font-label-md text-label-md">{s.label}</span>
            </button>
          ))}
        </div>
      </main>

      <footer className="glass-input fixed bottom-0 inset-x-0 z-50 p-3 safe-area-pb">
        <div className="flex items-end gap-2 max-w-[800px] mx-auto w-full">
          <button className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors shrink-0">
            <span className="material-symbols-outlined text-[26px]" style={{ fontVariationSettings: "'FILL' 0" }}>add_circle</span>
          </button>
          <div className="flex-1 bg-surface-container-low rounded-3xl border border-outline-variant/30 px-4 py-2 flex items-center min-h-[44px]">
            <textarea
              ref={textareaRef}
              className="w-full bg-transparent border-none p-0 focus:ring-0 resize-none font-body-md text-body-md text-on-surface placeholder-outline max-h-32"
              placeholder="Écrire un message..."
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
