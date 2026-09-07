"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { getCurrentUser } from "@/lib/auth";
import { listMyConversations, type Conversation } from "@/lib/supabase/messages";

function timeAgo(dateStr: string) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "à l'instant";
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "hier";
  if (days < 7) return `${days} j`;
  return new Date(dateStr).toLocaleDateString("fr-FR");
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[] | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getCurrentUser(), listMyConversations()]).then(([user, { data }]) => {
      setCurrentUserId(user?.id ?? null);
      setConversations(data);
    });
  }, []);

  return (
    <div className="bg-background text-on-surface min-h-screen flex flex-col antialiased">
      <header className="sticky top-0 w-full z-30 bg-surface/80 backdrop-blur-xl shadow-sm flex items-center justify-between px-container-margin min-h-14 pt-[env(safe-area-inset-top)]">
        <Link href="/profile" aria-label="Retour" className="flex items-center justify-center p-2 -ml-2 text-primary hover:opacity-70 active:scale-95 transition-transform">
          <span className="material-symbols-outlined text-2xl">arrow_back_ios</span>
        </Link>
        <h1 className="font-headline-sm text-headline-sm text-on-surface absolute left-1/2 -translate-x-1/2">Messages</h1>
        <div className="w-8 h-8" />
      </header>

      <main className="flex-1 w-full max-w-[800px] mx-auto px-container-margin pt-lg pb-xl">
        {conversations === null && (
          <div className="flex justify-center py-xl">
            <span className="w-8 h-8 border-4 border-primary-container/30 border-t-primary rounded-full animate-spin" />
          </div>
        )}

        {conversations !== null && conversations.length === 0 && (
          <div className="flex flex-col items-center justify-center py-xl text-center">
            <div className="w-20 h-20 mb-lg bg-surface-container-low rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[36px]">chat_bubble</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">Aucune conversation pour le moment</h3>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-sm">
              Une fois qu&apos;une correspondance est confirmée, vous pourrez échanger avec l&apos;autre personne ici.
            </p>
          </div>
        )}

        {conversations !== null && conversations.length > 0 && (
          <ul className="flex flex-col rounded-xl overflow-hidden bg-surface-container-lowest border border-outline-variant/30 shadow-sm">
            {conversations.map(({ match, lastMessage }, i) => {
              const isLostSide = match.lost_item.user_id === currentUserId;
              const otherItem = isLostSide ? match.found_item : match.lost_item;
              const isMine = lastMessage?.sender_id === currentUserId;
              return (
                <li key={match.id} className={i < conversations.length - 1 ? "border-b border-outline-variant/30" : ""}>
                  <Link href={`/chat/${match.id}`} className="block px-md py-4 hover:bg-surface-container-low transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="relative shrink-0 mt-1 w-12 h-12 rounded-full overflow-hidden bg-surface-container-high flex items-center justify-center text-primary">
                        {otherItem.photos?.[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img alt={otherItem.title} className="w-full h-full object-cover" src={otherItem.photos[0]} />
                        ) : (
                          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                            {otherItem.category_icon || "inventory_2"}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-label-md text-label-md text-on-surface font-semibold truncate pr-2">{otherItem.title}</span>
                          {lastMessage && <span className="font-label-md text-[11px] text-outline shrink-0">{timeAgo(lastMessage.created_at)}</span>}
                        </div>
                        <p className="font-body-md text-body-md text-on-surface-variant truncate">
                          {lastMessage ? `${isMine ? "Vous : " : ""}${lastMessage.body}` : "Aucun message pour le moment — dites bonjour !"}
                        </p>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </main>

      <BottomNav active="profile" />
    </div>
  );
}
