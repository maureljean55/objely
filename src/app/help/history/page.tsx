"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listMySupportConversations, type SupportConversationSummary } from "@/lib/supabase/support";

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  bot: { label: "En cours", className: "bg-primary-fixed text-on-primary-fixed-variant" },
  escalated: { label: "En attente d'un conseiller", className: "bg-secondary/15 text-secondary" },
  closed: { label: "Archivée", className: "bg-surface-variant text-on-surface-variant" },
};

function timeAgo(dateStr: string) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "à l'instant";
  if (mins < 60) return `il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "hier";
  if (days < 7) return `il y a ${days} j`;
  return new Date(dateStr).toLocaleDateString("fr-FR");
}

export default function HelpHistoryPage() {
  const [conversations, setConversations] = useState<SupportConversationSummary[] | null>(null);

  useEffect(() => {
    listMySupportConversations().then(({ data }) => setConversations(data));
  }, []);

  return (
    <div className="bg-background text-on-surface min-h-screen flex flex-col antialiased">
      <header className="sticky top-0 w-full z-30 bg-surface/80 backdrop-blur-xl shadow-sm flex items-center justify-between px-container-margin min-h-14 pt-[env(safe-area-inset-top)]">
        <Link href="/help" aria-label="Retour" className="flex items-center justify-center p-2 -ml-2 text-primary hover:opacity-70 active:scale-95 transition-transform">
          <span className="material-symbols-outlined text-2xl">arrow_back_ios</span>
        </Link>
        <h1 className="font-headline-sm text-headline-sm text-on-surface absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0">
          Historique
        </h1>
        <div className="w-8 h-8" />
      </header>

      <main className="flex-1 w-full max-w-[800px] mx-auto px-container-margin pt-lg pb-xl">
        <div className="mb-lg">
          <p className="font-body-md text-body-md text-on-surface-variant">Retrouvez toutes vos conversations avec le service client Objely.</p>
        </div>

        {conversations === null && (
          <div className="flex justify-center py-xl">
            <span className="w-8 h-8 border-4 border-primary-container/30 border-t-primary rounded-full animate-spin" />
          </div>
        )}

        {conversations !== null && conversations.length === 0 && (
          <div className="flex flex-col items-center justify-center py-xl text-center">
            <div className="w-20 h-20 mb-lg bg-surface-container-low rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[36px]">forum</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">Aucune conversation pour le moment</h3>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-sm">
              Vos échanges avec le service client apparaîtront ici.
            </p>
          </div>
        )}

        {conversations !== null && conversations.length > 0 && (
          <ul className="flex flex-col rounded-xl overflow-hidden bg-surface-container-lowest border border-outline-variant/30 shadow-sm">
            {conversations.map(({ conversation, lastMessage }, i) => {
              const status = STATUS_LABEL[conversation.status];
              return (
                <li key={conversation.id} className={i < conversations.length - 1 ? "border-b border-outline-variant/30" : ""}>
                  <Link href={`/help/chat?conversation=${conversation.id}`} className="block px-md py-4 hover:bg-surface-container-low transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="relative shrink-0 mt-1">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-primary-container text-on-primary-container">
                          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                            {conversation.status === "escalated" ? "support_agent" : "smart_toy"}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-label-md text-label-md text-on-surface font-semibold truncate pr-2">Service client Objely</span>
                          {lastMessage && <span className="font-label-md text-[11px] text-outline shrink-0">{timeAgo(lastMessage.created_at)}</span>}
                        </div>
                        <p className="font-body-md text-body-md text-on-surface-variant truncate mb-1.5">
                          {lastMessage ? `${lastMessage.sender === "user" ? "Vous : " : ""}${lastMessage.body}` : "Aucun message"}
                        </p>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-label-md text-[11px] ${status.className}`}>
                          {status.label}
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
