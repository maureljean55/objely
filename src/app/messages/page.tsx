"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import BottomNav from "@/components/BottomNav";
import { getCurrentUser } from "@/lib/auth";
import { listMyConversations, type Conversation } from "@/lib/supabase/messages";
import { listMyDirectConversations, type DirectConversationSummary } from "@/lib/supabase/directMessages";

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

type Row =
  | { kind: "match"; key: string; lastMessageAt: string | null; conversation: Conversation }
  | { kind: "direct"; key: string; lastMessageAt: string | null; conversation: DirectConversationSummary };

export default function MessagesPage() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getCurrentUser(), listMyConversations(), listMyDirectConversations()]).then(
      ([user, { data: matches }, { data: directs }]) => {
        setCurrentUserId(user?.id ?? null);

        const matchRows: Row[] = (matches ?? []).map((conversation) => ({
          kind: "match",
          key: `match-${conversation.match.id}`,
          lastMessageAt: conversation.lastMessage?.created_at ?? null,
          conversation,
        }));
        const directRows: Row[] = (directs ?? []).map((conversation) => ({
          kind: "direct",
          key: `direct-${conversation.conversation_id}`,
          lastMessageAt: conversation.last_message_created_at,
          conversation,
        }));

        const merged = [...matchRows, ...directRows].sort((a, b) => {
          if (a.lastMessageAt && b.lastMessageAt) return b.lastMessageAt.localeCompare(a.lastMessageAt);
          if (a.lastMessageAt) return -1;
          if (b.lastMessageAt) return 1;
          return 0;
        });
        setRows(merged);
      },
    );
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
        {rows === null && (
          <div className="flex justify-center py-xl">
            <span className="w-8 h-8 border-4 border-primary-container/30 border-t-primary rounded-full animate-spin" />
          </div>
        )}

        {rows !== null && rows.length === 0 && (
          <div className="flex flex-col items-center justify-center py-xl text-center">
            <div className="w-20 h-20 mb-lg bg-surface-container-low rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[36px]">chat_bubble</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">Aucune conversation pour le moment</h3>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-sm">
              Une fois qu&apos;une correspondance est confirmée, ou après avoir scanné le QR Code de quelqu&apos;un, vous pourrez échanger ici.
            </p>
          </div>
        )}

        {rows !== null && rows.length > 0 && (
          <ul className="flex flex-col rounded-xl overflow-hidden bg-surface-container-lowest border border-outline-variant/30 shadow-sm">
            {rows.map((row, i) => {
              const isLast = i === rows.length - 1;
              if (row.kind === "match") {
                const { match, lastMessage } = row.conversation;
                const isLostSide = match.lost_item.user_id === currentUserId;
                const otherItem = isLostSide ? match.found_item : match.lost_item;
                const isMine = lastMessage?.sender_id === currentUserId;
                return (
                  <li key={row.key} className={!isLast ? "border-b border-outline-variant/30" : ""}>
                    <Link href={`/chat/${match.id}`} className="block px-md py-4 hover:bg-surface-container-low transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="relative shrink-0 mt-1 w-12 h-12 rounded-full overflow-hidden bg-surface-container-high flex items-center justify-center text-primary">
                          {otherItem.photos?.[0] ? (
                            <Image alt={otherItem.title} src={otherItem.photos[0]} fill sizes="48px" className="object-cover" />
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
              }

              const conversation = row.conversation;
              const isMine = conversation.last_message_sender_id === currentUserId;
              const peerName = conversation.other_full_name || "Utilisateur Objely";
              return (
                <li key={row.key} className={!isLast ? "border-b border-outline-variant/30" : ""}>
                  <Link href={`/dm/${conversation.conversation_id}`} className="block px-md py-4 hover:bg-surface-container-low transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="relative shrink-0 mt-1 w-12 h-12 rounded-full overflow-hidden bg-surface-container-high flex items-center justify-center text-on-surface-variant">
                        {conversation.other_avatar_url ? (
                          <Image alt={peerName} src={conversation.other_avatar_url} fill sizes="48px" className="object-cover" />
                        ) : (
                          <span className="material-symbols-outlined">person</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-label-md text-label-md text-on-surface font-semibold truncate pr-2">{peerName}</span>
                          {conversation.last_message_created_at && (
                            <span className="font-label-md text-[11px] text-outline shrink-0">{timeAgo(conversation.last_message_created_at)}</span>
                          )}
                        </div>
                        <p className="font-body-md text-body-md text-on-surface-variant truncate">
                          {conversation.last_message_body
                            ? `${isMine ? "Vous : " : ""}${conversation.last_message_body}`
                            : "Aucun message pour le moment — dites bonjour !"}
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
