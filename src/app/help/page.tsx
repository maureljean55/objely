"use client";

import { useState } from "react";
import Link from "next/link";

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
    <div className="bg-gradient-to-b from-surface-container to-background text-on-background min-h-screen antialiased pb-12">
      <header className="sticky top-0 z-30 w-full bg-surface/80 backdrop-blur-xl shadow-sm flex items-center justify-between px-container-margin h-14">
        <Link href="/profile" aria-label="Retour" className="text-primary hover:opacity-70 transition-opacity active:scale-95 flex items-center justify-center w-10 h-10 -ml-2 rounded-full">
          <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 0" }}>arrow_back_ios</span>
        </Link>
        <h1 className="font-headline-sm text-headline-sm text-on-surface absolute left-1/2 -translate-x-1/2">
          Support
        </h1>
        <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 bg-surface-container-high">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="Agent support"
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDU6JeAdh405-ve2qnbhookkk1hhUDtsY4zNzAR7xn73Ol1GsfA2cn7K-sct9yikuzOSE6AamFKeDlM1_rt0opv-A9xfXTjvvNz5icdY3J4ySOxNQWsMrMzCUzgi4RszxHe0Wnwcq_gkV_eBk_l8H_hpcy6b3WG3nr4_H03NCgqd3m0JerAZn_-saicn65oi7kEQ5rMB59SiiaHNJoJMSPoEjdrFIVYUpli5UqtHH9V_Ns9ZTNkO22j"
          />
        </div>
      </header>

      {/* Hero */}
      <section className="flex flex-col items-center text-center px-6 pt-10 pb-8 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 bg-primary-fixed/40 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="w-20 h-20 rounded-full bg-surface-container-lowest/80 backdrop-blur-md border border-outline-variant/30 flex items-center justify-center mb-5 shadow-[0_8px_24px_rgba(0,88,188,0.12)]">
          <span className="material-symbols-outlined text-[40px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
            waving_hand
          </span>
        </div>
        <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-2">
          Besoin d&apos;aide ? 👋
        </h2>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-[320px]">
          Notre équipe Objely est là pour vous accompagner.
        </p>
      </section>

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
    </div>
  );
}
