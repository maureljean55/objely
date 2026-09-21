"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import BottomNav from "@/components/BottomNav";
import { getCurrentUser } from "@/lib/auth";
import { listMyConversations, type Conversation } from "@/lib/supabase/messages";
import {
  listMyDirectConversations,
  deleteDirectConversation,
  type DirectConversationSummary,
} from "@/lib/supabase/directMessages";

function previewText(
  body: string | null,
  kind: "text" | "voice" | "restitution_proposal" | "attachment" | null | undefined,
  deletedAt: string | null | undefined,
) {
  if (deletedAt) return "Message supprimé";
  if (kind === "voice") return "🎤 Note vocale";
  if (kind === "restitution_proposal") return "📅 Rendez-vous de restitution";
  if (kind === "attachment") return "📎 Pièce jointe";
  return body ?? "";
}

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

type Tab = "all" | "matches" | "direct" | "closed";
const TABS: { id: Tab; label: string }[] = [
  { id: "all", label: "Toutes" },
  { id: "matches", label: "Correspondances" },
  { id: "direct", label: "Directs" },
  { id: "closed", label: "Restituées" },
];

export default function MessagesPage() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ conversationId: string; peerName: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<Tab>("all");

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

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteError(null);
    const { error } = await deleteDirectConversation(deleteTarget.conversationId);
    setIsDeleting(false);
    if (error) {
      setDeleteError("Impossible de supprimer la conversation. Réessayez.");
      return;
    }
    setRows((prev) => (prev ?? []).filter((row) => row.key !== `direct-${deleteTarget.conversationId}`));
    setDeleteTarget(null);
  };

  const tabCounts = useMemo(() => {
    const all = rows ?? [];
    return {
      all: all.length,
      matches: all.filter((r) => r.kind === "match" && !r.conversation.match.chat_closed_at).length,
      direct: all.filter((r) => r.kind === "direct").length,
      closed: all.filter((r) => r.kind === "match" && !!r.conversation.match.chat_closed_at).length,
    };
  }, [rows]);

  const visibleRows = useMemo(() => {
    let list = rows ?? [];
    if (tab === "matches") list = list.filter((r) => r.kind === "match" && !r.conversation.match.chat_closed_at);
    else if (tab === "direct") list = list.filter((r) => r.kind === "direct");
    else if (tab === "closed") list = list.filter((r) => r.kind === "match" && !!r.conversation.match.chat_closed_at);

    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((row) => {
      if (row.kind === "match") {
        const isLostSide = row.conversation.match.lost_item.user_id === currentUserId;
        const otherItem = isLostSide ? row.conversation.match.found_item : row.conversation.match.lost_item;
        const declarerName = row.conversation.otherProfile?.full_name ?? "";
        const lastBody = row.conversation.lastMessage?.body ?? "";
        return [otherItem.title, declarerName, lastBody].some((f) => f.toLowerCase().includes(q));
      }
      const peerName = row.conversation.other_full_name || "Utilisateur Objely";
      const lastBody = row.conversation.last_message_body ?? "";
      return [peerName, lastBody].some((f) => f.toLowerCase().includes(q));
    });
  }, [rows, tab, query, currentUserId]);

  return (
    <div className="bg-background text-on-surface min-h-screen flex flex-col antialiased pb-28">
      <header className="sticky top-0 w-full z-30 bg-surface/80 backdrop-blur-xl shadow-sm pt-[env(safe-area-inset-top)]">
        <div className="px-container-margin pt-md pb-md flex flex-col gap-md">
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface font-bold tracking-tight text-center">Message center</h1>

          <div className="relative">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[19px]">search</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher une personne, un objet, un message..."
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-surface-container-lowest shadow-sm text-on-surface placeholder:text-on-surface-variant/70 font-body-md text-body-md text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar">
            {TABS.map((t) => {
              const isActive = tab === t.id;
              const count = tabCounts[t.id];
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-label-md text-[13px] transition-all active:scale-95 ${
                    isActive ? "bg-primary text-on-primary shadow-sm" : "bg-surface-container-lowest text-on-surface-variant shadow-sm"
                  }`}
                >
                  {t.label}
                  {count > 0 && (
                    <span
                      className={`min-w-[18px] h-[18px] px-1 rounded-full text-[11px] flex items-center justify-center ${
                        isActive ? "bg-white/20 text-on-primary" : "bg-surface-container-high text-on-surface-variant"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[800px] mx-auto px-container-margin pt-md pb-xl flex flex-col gap-md">
        <div className="relative overflow-hidden rounded-2xl bg-surface-container-lowest p-3.5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-primary shrink-0">
              <span className="material-symbols-outlined text-[18px]">verified_user</span>
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <p className="font-label-md text-label-md text-on-surface truncate">Protocole Objely Sécurisé</p>
              <p className="font-body-md text-body-md text-[12px] text-on-surface-variant truncate">Coordonnées chiffrées & restitution encadrée</p>
            </div>
          </div>
        </div>

        {rows === null && (
          <div className="flex justify-center py-xl">
            <span className="w-8 h-8 border-4 border-primary-container/30 border-t-primary rounded-full animate-spin" />
          </div>
        )}

        {rows !== null && rows.length === 0 && (
          <div className="flex flex-col items-center justify-center py-xl text-center">
            <div className="w-20 h-20 mb-lg rounded-full bg-primary-fixed flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[36px]">chat_bubble</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-2">Aucune conversation pour le moment</h3>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-sm">
              Une fois qu&apos;une correspondance est confirmée, ou après avoir scanné le QR Code de quelqu&apos;un, vous pourrez échanger ici.
            </p>
          </div>
        )}

        {rows !== null && rows.length > 0 && visibleRows.length === 0 && (
          <div className="flex flex-col items-center justify-center py-xl text-center">
            <p className="font-body-md text-body-md text-on-surface-variant">Aucun résultat pour ce filtre.</p>
          </div>
        )}

        {visibleRows.length > 0 && (
          <div className="flex flex-col gap-2.5">
            {visibleRows.map((row) => {
              if (row.kind === "match") {
                const { match, lastMessage, otherProfile } = row.conversation;
                const isMine = lastMessage?.sender_id === currentUserId;
                const isClosed = !!match.chat_closed_at;
                const declarerName = otherProfile?.full_name || "Utilisateur Objely";
                return (
                  <Link
                    key={row.key}
                    href={`/chat/${match.id}`}
                    className="flex items-start gap-3 p-3.5 rounded-2xl bg-surface-container-lowest shadow-sm active:scale-[0.99] transition-transform"
                  >
                    <div className="relative shrink-0 w-12 h-12 rounded-full overflow-hidden bg-surface-container-high flex items-center justify-center text-on-surface-variant">
                      {otherProfile?.avatar_url ? (
                        <Image alt={declarerName} src={otherProfile.avatar_url} fill sizes="48px" className="object-cover" />
                      ) : (
                        <span className="material-symbols-outlined">person</span>
                      )}
                    </div>
                    <div className="flex flex-col min-w-0 flex-1 gap-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold truncate">{declarerName}</h3>
                        {lastMessage && <span className="font-label-md text-[11px] text-outline shrink-0">{timeAgo(lastMessage.created_at)}</span>}
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container text-on-surface font-label-md text-[11px]">
                          <span className="font-semibold">{match.match_percent}% de correspondance</span>
                        </div>
                        {isClosed ? (
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface font-label-md text-[11px]">
                            <span className="material-symbols-outlined text-[12px] text-primary">check_circle</span>
                            <span className="font-medium">Restitué</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-variant text-on-surface font-label-md text-[11px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                            <span className="font-semibold">Conversation active</span>
                          </div>
                        )}
                      </div>
                      <p className="font-body-md text-body-md text-[13px] text-on-surface-variant truncate">
                        {lastMessage
                          ? `${isMine ? "Vous : " : ""}${previewText(lastMessage.body, lastMessage.kind, lastMessage.deleted_at)}`
                          : "Aucun message pour le moment — dites bonjour !"}
                      </p>
                    </div>
                  </Link>
                );
              }

              const conversation = row.conversation;
              const isMine = conversation.last_message_sender_id === currentUserId;
              const peerName = conversation.other_full_name || "Utilisateur Objely";
              return (
                <div key={row.key} className="flex items-stretch gap-2 rounded-2xl bg-surface-container-lowest shadow-sm overflow-hidden">
                  <Link href={`/dm/${conversation.conversation_id}`} className="flex-1 min-w-0 flex items-start gap-3 p-3.5 active:scale-[0.99] transition-transform">
                    <div className="relative shrink-0 w-12 h-12 rounded-full overflow-hidden bg-surface-container-high flex items-center justify-center text-on-surface-variant">
                      {conversation.other_avatar_url ? (
                        <Image alt={peerName} src={conversation.other_avatar_url} fill sizes="48px" className="object-cover" />
                      ) : (
                        <span className="material-symbols-outlined">person</span>
                      )}
                    </div>
                    <div className="flex flex-col min-w-0 flex-1 gap-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold truncate">{peerName}</h3>
                        {conversation.last_message_created_at && (
                          <span className="font-label-md text-[11px] text-outline shrink-0">{timeAgo(conversation.last_message_created_at)}</span>
                        )}
                      </div>
                      <p className="font-body-md text-body-md text-[13px] text-on-surface-variant truncate">
                        {conversation.last_message_created_at
                          ? `${isMine ? "Vous : " : ""}${previewText(conversation.last_message_body, conversation.last_message_kind, conversation.last_message_deleted_at)}`
                          : "Aucun message pour le moment — dites bonjour !"}
                      </p>
                    </div>
                  </Link>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget({ conversationId: conversation.conversation_id, peerName })}
                    aria-label={`Supprimer la conversation avec ${peerName}`}
                    className="shrink-0 w-11 flex items-center justify-center text-on-surface-variant hover:text-error hover:bg-error-container/20 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {deleteTarget && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/30 backdrop-blur-sm"
          onClick={() => !isDeleting && setDeleteTarget(null)}
        >
          <div
            className="w-full sm:w-[400px] bg-surface-container-lowest rounded-t-[28px] sm:rounded-[28px] p-lg pb-8 sm:pb-lg shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-headline-md text-headline-md text-on-surface mb-1">Supprimer la conversation avec {deleteTarget.peerName} ?</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mb-lg">
              Elle disparaîtra de votre liste. Si {deleteTarget.peerName} vous répond, la conversation réapparaîtra.
            </p>
            {deleteError && <p className="font-body-md text-[13px] text-error mb-3">{deleteError}</p>}
            <div className="flex gap-sm">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteTarget(null)}
                className="flex-1 h-12 rounded-[14px] bg-surface-container-high text-on-surface font-headline-sm text-headline-sm hover:bg-surface-container-highest transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDelete}
                className="flex-1 h-12 rounded-[14px] bg-error text-on-error font-headline-sm text-headline-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? "Suppression…" : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav active="profile" />
    </div>
  );
}
