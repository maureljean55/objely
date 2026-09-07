"use client";

import { useState } from "react";
import type { FaqItem } from "@/lib/supabase/faq";

export default function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = items.filter(
    (item) => item.question.toLowerCase().includes(query.toLowerCase()) || item.answer.toLowerCase().includes(query.toLowerCase()),
  );

  return (
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
        {filtered.length === 0 ? (
          <p className="px-lg py-6 font-body-md text-body-md text-on-surface-variant text-center">Aucune réponse trouvée.</p>
        ) : (
          filtered.map((item, i) => {
            const isOpen = openId === item.id;
            return (
              <div key={item.id} className={i < filtered.length - 1 ? "border-b border-surface-variant/50" : ""}>
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : item.id)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between gap-md px-lg py-4 text-left hover:bg-black/[0.02] transition-colors"
                >
                  <span className="font-body-lg text-body-lg text-on-surface">{item.question}</span>
                  <span
                    className="material-symbols-outlined text-primary shrink-0 transition-transform duration-200"
                    style={{ transform: isOpen ? "rotate(90deg)" : "none" }}
                  >
                    chevron_right
                  </span>
                </button>
                {isOpen && (
                  <p className="px-lg pb-4 -mt-1 font-body-md text-body-md text-on-surface-variant animate-fadeIn">{item.answer}</p>
                )}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
