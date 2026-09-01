"use client";

import { useState } from "react";
import Link from "next/link";
import HelpNav from "@/components/HelpNav";

const FAQ_ITEMS = [
  "Comment déclarer un objet perdu ou trouvé ?",
  "Comment fonctionne la correspondance entre objets ?",
  "Comment organiser une restitution en toute sécurité ?",
  "Comment supprimer mon compte ?",
];

export default function HelpCenterPage() {
  const [query, setQuery] = useState("");
  const filteredFaq = FAQ_ITEMS.filter((q) => q.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="bg-gradient-to-b from-surface-container to-background text-on-background min-h-screen antialiased pb-32">
      <header className="flex items-center px-container-margin py-base">
        <Link href="/profile" aria-label="Retour" className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full hover:bg-surface-container-high/50 transition-colors text-on-surface-variant">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
      </header>

      <main className="max-w-2xl mx-auto px-container-margin flex flex-col gap-lg">
        {/* Messages / Aide */}
        <section className="bg-surface-container-lowest rounded-[28px] soft-shadow overflow-hidden">
          <Link href="/help/history" className="flex items-center justify-between px-lg py-5 border-b border-surface-variant/50 hover:bg-black/[0.02] transition-colors">
            <span className="font-headline-md text-headline-md text-on-surface font-bold">Messages</span>
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>chat_bubble</span>
          </Link>
          <a href="#faq" className="flex items-center justify-between px-lg py-5 hover:bg-black/[0.02] transition-colors">
            <span className="font-headline-md text-headline-md text-on-surface font-bold">Aide</span>
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>help</span>
          </a>
        </section>

        {/* Start a conversation */}
        <Link
          href="/help/chat"
          className="bg-surface-container-lowest rounded-[28px] soft-shadow px-lg py-5 flex items-center justify-between gap-md hover:bg-black/[0.02] transition-colors"
        >
          <div>
            <h2 className="font-headline-md text-headline-md text-on-surface font-bold mb-1">Envoyez-nous un message</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">Nous répondons généralement en quelques minutes</p>
          </div>
          <span className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
          </span>
        </Link>

        {/* FAQ */}
        <section id="faq" className="bg-surface-container-lowest rounded-[28px] soft-shadow overflow-hidden scroll-mt-lg">
          <div className="flex items-center gap-3 bg-surface-container-low mx-3 mt-3 mb-2 px-4 py-3 rounded-2xl">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Trouver une réponse"
              className="flex-1 bg-transparent border-none p-0 font-headline-sm text-headline-sm text-on-surface font-bold placeholder:text-on-surface placeholder:font-bold focus:ring-0 outline-none"
            />
            <span className="material-symbols-outlined text-primary shrink-0">search</span>
          </div>
          <div className="flex flex-col">
            {filteredFaq.length === 0 ? (
              <p className="px-lg py-6 font-body-md text-body-md text-on-surface-variant text-center">Aucune réponse trouvée.</p>
            ) : (
              filteredFaq.map((question, i) => (
                <button
                  key={question}
                  className={`flex items-center justify-between gap-md px-lg py-4 text-left hover:bg-black/[0.02] transition-colors ${
                    i < filteredFaq.length - 1 ? "border-b border-surface-variant/50" : ""
                  }`}
                >
                  <span className="font-body-lg text-body-lg text-on-surface">{question}</span>
                  <span className="material-symbols-outlined text-primary shrink-0">chevron_right</span>
                </button>
              ))
            )}
          </div>
        </section>
      </main>

      <HelpNav active="messages" />
    </div>
  );
}
