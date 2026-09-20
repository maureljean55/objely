"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { CommunityMember, CommunityMessage } from "@/lib/supabase/communities";
import type { Item } from "@/lib/supabase/items";

const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function MemberAvatar({ name, avatarUrl, size = 32 }: { name: string; avatarUrl: string | null; size?: number }) {
  return (
    <div
      className="relative shrink-0 rounded-full overflow-hidden bg-surface-container-highest text-on-surface-variant flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {avatarUrl ? (
        <Image alt={name} src={avatarUrl} fill sizes={`${size}px`} className="object-cover" />
      ) : (
        <span className="font-label-md text-label-md">{initials(name)}</span>
      )}
    </div>
  );
}

function ReactionBar({
  message,
  currentUserId,
  isMine,
  onToggle,
}: {
  message: CommunityMessage;
  currentUserId: string;
  isMine: boolean;
  onToggle: (emoji: string) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);

  const grouped = new Map<string, number>();
  for (const r of message.reactions) grouped.set(r.emoji, (grouped.get(r.emoji) ?? 0) + 1);

  return (
    <div className={`relative flex items-center gap-1 flex-wrap px-1 ${isMine ? "justify-end" : "justify-start"}`}>
      {[...grouped.entries()].map(([emoji, count]) => {
        const mine = message.reactions.some((r) => r.user_id === currentUserId && r.emoji === emoji);
        return (
          <button
            key={emoji}
            type="button"
            onClick={() => onToggle(emoji)}
            className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[11px] border transition-colors ${
              mine ? "bg-primary/15 border-primary/40 text-primary" : "bg-surface-container-lowest border-outline-variant/30 text-on-surface-variant"
            }`}
          >
            <span>{emoji}</span>
            <span className="font-label-md">{count}</span>
          </button>
        );
      })}
      <button
        type="button"
        onClick={() => setPickerOpen((v) => !v)}
        aria-label="Réagir"
        className="w-5 h-5 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors"
      >
        <span className="material-symbols-outlined text-[14px]">add_reaction</span>
      </button>
      {pickerOpen && (
        <>
          <div className="fixed inset-0 z-[90]" onClick={() => setPickerOpen(false)} />
          <div
            className={`absolute bottom-full mb-1 z-[91] flex items-center gap-1 bg-surface-container-lowest rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.15)] border border-outline-variant/15 px-2 py-1.5 animate-popIn ${
              isMine ? "right-0" : "left-0"
            }`}
          >
            {QUICK_REACTIONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => {
                  onToggle(emoji);
                  setPickerOpen(false);
                }}
                className="text-[18px] w-7 h-7 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors active:scale-90"
              >
                {emoji}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  searching: { label: "Recherche active", className: "bg-error-container text-on-error-container" },
  matched: { label: "Correspondance trouvée", className: "bg-primary-fixed text-primary" },
  recovered: { label: "Retrouvé", className: "bg-[#e8f5e9] text-[#2e7d32]" },
  returned: { label: "Restitué", className: "bg-[#e8f5e9] text-[#2e7d32]" },
};

function SharedItemCard({ message }: { message: CommunityMessage }) {
  const item = message.shared_item;
  if (!item || item.deleted_at) {
    return <p className="font-body-md text-body-md italic">Cet objet n&apos;est plus disponible.</p>;
  }
  const status = STATUS_LABEL[item.status] ?? STATUS_LABEL.searching;

  return (
    <div className="w-64">
      <div className="flex items-center justify-between mb-2">
        <span className="flex items-center gap-1 font-label-md text-[10px] font-semibold text-primary uppercase tracking-wider">
          <span className="material-symbols-outlined text-[14px]">sell</span>
          Objet partagé
        </span>
        <span className={`px-2 py-0.5 rounded-full font-label-md text-[10px] font-semibold ${status.className}`}>
          {item.type === "lost" ? "Objet perdu" : "Objet trouvé"}
        </span>
      </div>
      <div className="flex gap-2.5 mb-2.5">
        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-surface-container-high text-on-surface-variant flex items-center justify-center shrink-0">
          {item.photos?.[0] ? (
            <Image alt={item.title} src={item.photos[0]} fill sizes="64px" className="object-cover" />
          ) : (
            <span className="material-symbols-outlined">{item.category_icon || "inventory_2"}</span>
          )}
        </div>
        <div className="min-w-0 flex-1 text-left">
          <p className="font-body-lg text-body-lg font-semibold text-on-surface truncate">{item.title}</p>
          {item.location && (
            <p className="font-label-md text-[11px] text-on-surface-variant truncate flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">location_on</span>
              {item.location}
            </p>
          )}
        </div>
      </div>
      <Link
        href={`/search/${item.id}`}
        className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-white font-label-md text-label-md font-semibold shadow-sm"
        style={{ background: "linear-gradient(135deg, #0058bc, #5952af)" }}
      >
        Voir l&apos;objet
        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
      </Link>
    </div>
  );
}

type Props = {
  communityId: string;
  communityName: string;
  communityCoverUrl: string | null;
  memberCount: number;
  currentUserId: string;
  isOwner: boolean;
  members: CommunityMember[];
  messages: CommunityMessage[];
  myItems: Item[];
  onSend: (body: string) => Promise<boolean>;
  onShareItem: (itemId: string) => Promise<boolean>;
  onToggleReaction: (messageId: string, emoji: string) => void;
  onBack: () => void;
  onLeave: () => Promise<boolean>;
  onDeleteCommunity: () => Promise<boolean>;
};

/** WhatsApp-style group chat: unlike ChatThread (built for exactly two parties), every
 * bubble here resolves its sender against the full member list, since any of N people
 * might have sent it. */
export default function CommunityChatThread({
  communityId,
  communityName,
  communityCoverUrl,
  memberCount,
  currentUserId,
  isOwner,
  members,
  messages,
  myItems,
  onSend,
  onShareItem,
  onToggleReaction,
  onBack,
  onLeave,
  onDeleteCommunity,
}: Props) {
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSharePicker, setShowSharePicker] = useState(false);
  const [sharingItemId, setSharingItemId] = useState<string | null>(null);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const membersById = new Map(members.map((m) => [m.user_id, m]));
  const nameFor = (userId: string) => membersById.get(userId)?.full_name || "Utilisateur Objely";
  const avatarFor = (userId: string) => membersById.get(userId)?.avatar_url ?? null;

  const handleSend = async () => {
    const body = draft.trim();
    if (!body || isSending) return;
    setIsSending(true);
    setActionError(null);
    setDraft("");
    const sent = await onSend(body);
    if (!sent) {
      setDraft(body);
      setActionError("Le message n'a pas pu être envoyé, réessayez.");
    }
    setIsSending(false);
  };

  const handleShareItem = async (itemId: string) => {
    setSharingItemId(itemId);
    setActionError(null);
    const ok = await onShareItem(itemId);
    setSharingItemId(null);
    if (ok) {
      setShowSharePicker(false);
    } else {
      setActionError("L'objet n'a pas pu être partagé, réessayez.");
    }
  };

  const handleLeave = async () => {
    setIsLeaving(true);
    setConfirmError(null);
    const ok = await onLeave();
    setIsLeaving(false);
    if (!ok) setConfirmError("Une erreur est survenue, réessayez.");
  };

  const handleDeleteCommunity = async () => {
    setIsDeleting(true);
    setConfirmError(null);
    const ok = await onDeleteCommunity();
    setIsDeleting(false);
    if (!ok) setConfirmError("Une erreur est survenue, réessayez.");
  };

  return (
    <div className="bg-background text-on-background font-body-md antialiased">
      <header
        className="glass-header fixed top-0 inset-x-0 z-50 flex justify-between items-center w-full px-container-margin pb-base shadow-[0_1px_0_rgba(0,0,0,0.05)]"
        style={{ paddingTop: "calc(0.5rem + env(safe-area-inset-top))" }}
      >
        <button
          type="button"
          onClick={onBack}
          aria-label="Retour"
          className="text-primary p-2 -ml-2 rounded-full hover:bg-surface-container-high/50 transition-colors flex items-center"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>
            arrow_back_ios
          </span>
        </button>

        <Link href={`/communities/${communityId}/info`} className="flex items-center gap-2 min-w-0">
          <div className="relative w-8 h-8 rounded-full overflow-hidden bg-surface-container-high flex items-center justify-center text-on-surface-variant shrink-0">
            {communityCoverUrl ? (
              <Image alt={communityName} src={communityCoverUrl} fill sizes="32px" className="object-cover" />
            ) : (
              <span className="material-symbols-outlined text-[18px]">groups</span>
            )}
          </div>
          <div className="min-w-0 text-left">
            <h1 className="font-headline-sm text-headline-sm text-on-surface truncate">{communityName}</h1>
            <p className="font-label-md text-[11px] text-on-surface-variant">
              {memberCount} {memberCount > 1 ? "membres" : "membre"}
            </p>
          </div>
        </Link>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowMenu((v) => !v)}
            aria-label="Autres actions"
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container-high/50 transition-colors text-on-surface"
          >
            <span className="material-symbols-outlined">more_vert</span>
          </button>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-[90]" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-full mt-2 w-72 origin-top-right bg-surface-container-lowest rounded-[20px] overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.06),0_20px_48px_-12px_rgba(0,0,0,0.22)] border border-outline-variant/10 p-1 z-[91] animate-popIn">
                <Link
                  href={`/communities/${communityId}/info`}
                  onClick={() => setShowMenu(false)}
                  className="w-full py-3 px-3.5 flex items-center gap-3.5 rounded-[14px] text-on-surface font-body-md text-body-md hover:bg-surface-variant/50 active:bg-surface-variant/70 transition-colors"
                >
                  <span className="w-5 flex justify-center shrink-0 text-on-surface-variant">
                    <span className="material-symbols-outlined text-[20px]">info</span>
                  </span>
                  Informations et membres
                </Link>

                <div className="h-px bg-outline-variant/15 my-1 mx-3.5" />

                {isOwner ? (
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      setShowDeleteConfirm(true);
                    }}
                    className="w-full py-3 px-3.5 flex items-center gap-3.5 rounded-[14px] text-error font-body-md text-body-md hover:bg-error-container/25 active:bg-error-container/40 transition-colors"
                  >
                    <span className="w-5 flex justify-center shrink-0">
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </span>
                    Supprimer la communauté
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      setShowLeaveConfirm(true);
                    }}
                    className="w-full py-3 px-3.5 flex items-center gap-3.5 rounded-[14px] text-error font-body-md text-body-md hover:bg-error-container/25 active:bg-error-container/40 transition-colors"
                  >
                    <span className="w-5 flex justify-center shrink-0">
                      <span className="material-symbols-outlined text-[20px]">logout</span>
                    </span>
                    Quitter la communauté
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </header>

      <main className="min-h-screen px-container-margin py-md pt-[calc(92px+env(safe-area-inset-top))] pb-[130px] flex flex-col gap-md">
        {messages.length === 0 && (
          <p className="font-body-md text-body-md text-on-surface-variant text-center">
            Aucun message pour le moment. Lancez la discussion !
          </p>
        )}

        {messages.map((message) => {
          const isMine = message.sender_id === currentUserId;
          const isDeleted = !!message.deleted_at;
          const name = nameFor(message.sender_id);
          const isItemShare = message.kind === "item_share" && !isDeleted;
          return (
            <div key={message.id} className={`flex gap-2 max-w-[85%] ${isMine ? "self-end flex-row-reverse" : "self-start"}`}>
              {!isMine && <MemberAvatar name={name} avatarUrl={avatarFor(message.sender_id)} />}
              <div className="flex flex-col gap-1 min-w-0">
                {!isMine && (
                  <span className="font-label-md text-[11px] font-semibold text-primary px-1">{name}</span>
                )}
                <div
                  className={`rounded-2xl shadow-sm ${isItemShare ? "p-3" : "px-4 py-2.5"} ${
                    isDeleted
                      ? "bg-surface-container-high text-on-surface-variant italic"
                      : isMine
                        ? "message-out text-on-primary text-right"
                        : "bg-surface-container message-in text-on-surface"
                  }`}
                >
                  {isDeleted ? (
                    <p className="font-body-md text-body-md">Message supprimé</p>
                  ) : isItemShare ? (
                    <SharedItemCard message={message} />
                  ) : (
                    <p className="font-body-md text-body-md whitespace-pre-wrap">{message.body}</p>
                  )}
                </div>
                {!isDeleted && (
                  <ReactionBar
                    message={message}
                    currentUserId={currentUserId}
                    isMine={isMine}
                    onToggle={(emoji) => onToggleReaction(message.id, emoji)}
                  />
                )}
                <div className={`flex items-center gap-1 font-label-md text-[10px] text-outline px-1 ${isMine ? "justify-end" : "justify-start"}`}>
                  <span>{formatTime(message.created_at)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </main>

      <footer className="glass-input fixed bottom-0 inset-x-0 z-50 p-3 safe-area-pb">
        <div className="max-w-7xl mx-auto w-full">
          {actionError && (
            <div className="flex items-center justify-between gap-2 px-3 py-2 mb-1.5 bg-error-container/40 rounded-lg">
              <span className="font-body-md text-[13px] text-error">{actionError}</span>
              <button type="button" onClick={() => setActionError(null)} aria-label="Fermer" className="text-error p-1 shrink-0">
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
          )}

          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={() => setShowSharePicker(true)}
              aria-label="Partager un objet"
              className="p-2 bg-surface-container-high text-on-surface-variant rounded-full hover:bg-surface-container-highest transition-colors shrink-0 flex items-center justify-center h-11 w-11"
            >
              <span className="material-symbols-outlined">add</span>
            </button>
            <div className="flex-1 bg-surface-container-low rounded-xl border border-outline-variant/30 px-4 py-2 flex items-center min-h-[44px]">
              <textarea
                ref={textareaRef}
                className="w-full bg-transparent border-none p-0 focus:ring-0 resize-none font-body-md text-body-md text-on-surface placeholder-outline max-h-32"
                placeholder="Message..."
                rows={1}
                maxLength={4000}
                value={draft}
                onChange={(e) => {
                  setDraft(e.target.value);
                  const el = textareaRef.current;
                  if (el) {
                    el.style.height = "0px";
                    el.style.height = `${el.scrollHeight}px`;
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
            </div>
            <button
              type="button"
              onClick={handleSend}
              disabled={!draft.trim() || isSending}
              className="p-2 bg-primary text-on-primary rounded-full hover:opacity-90 transition-opacity shrink-0 shadow-sm flex items-center justify-center h-11 w-11 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined ml-1" style={{ fontVariationSettings: "'FILL' 1" }}>
                send
              </span>
            </button>
          </div>
        </div>
      </footer>

      {showSharePicker && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/30 backdrop-blur-sm"
          onClick={() => setShowSharePicker(false)}
        >
          <div
            className="w-full sm:w-[420px] max-h-[70vh] overflow-y-auto bg-surface-container-lowest rounded-t-[28px] sm:rounded-[28px] p-lg pb-8 sm:pb-lg shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-headline-md text-headline-md text-on-surface mb-lg">Partager un objet</h2>
            {myItems.length === 0 ? (
              <p className="font-body-md text-body-md text-on-surface-variant">
                Vous n&apos;avez aucun objet déclaré à partager pour le moment.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {myItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleShareItem(item.id)}
                    disabled={sharingItemId !== null}
                    className="w-full flex items-center gap-3 p-2.5 rounded-2xl hover:bg-surface-variant/40 transition-colors disabled:opacity-50"
                  >
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-surface-container-high text-on-surface-variant flex items-center justify-center shrink-0">
                      {item.photos?.[0] ? (
                        <Image alt={item.title} src={item.photos[0]} fill sizes="48px" className="object-cover" />
                      ) : (
                        <span className="material-symbols-outlined">{item.category_icon || "inventory_2"}</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1 text-left">
                      <p className="font-body-md text-body-md text-on-surface truncate">{item.title}</p>
                      <p className="font-label-md text-[11px] text-on-surface-variant">{item.type === "lost" ? "Objet perdu" : "Objet trouvé"}</p>
                    </div>
                    {sharingItemId === item.id && (
                      <span className="w-4 h-4 border-2 border-primary-container/30 border-t-primary rounded-full animate-spin shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {showLeaveConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/30 backdrop-blur-sm"
          onClick={() => !isLeaving && setShowLeaveConfirm(false)}
        >
          <div className="w-full sm:w-[400px] bg-surface-container-lowest rounded-t-[28px] sm:rounded-[28px] p-lg pb-8 sm:pb-lg shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-headline-md text-headline-md text-on-surface mb-1">Quitter {communityName} ?</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mb-lg">
              Vous ne recevrez plus les messages de cette communauté. Vous pourrez la rejoindre à nouveau plus tard.
            </p>
            {confirmError && <p className="font-body-md text-[13px] text-error mb-3">{confirmError}</p>}
            <div className="flex gap-sm">
              <button
                type="button"
                disabled={isLeaving}
                onClick={() => setShowLeaveConfirm(false)}
                className="flex-1 h-12 rounded-[14px] bg-surface-container-high text-on-surface font-headline-sm text-headline-sm hover:bg-surface-container-highest transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={isLeaving}
                onClick={handleLeave}
                className="flex-1 h-12 rounded-[14px] bg-error text-on-error font-headline-sm text-headline-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLeaving ? "Départ…" : "Quitter"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/30 backdrop-blur-sm"
          onClick={() => !isDeleting && setShowDeleteConfirm(false)}
        >
          <div className="w-full sm:w-[400px] bg-surface-container-lowest rounded-t-[28px] sm:rounded-[28px] p-lg pb-8 sm:pb-lg shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-headline-md text-headline-md text-on-surface mb-1">Supprimer {communityName} ?</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mb-lg">
              Cette action est définitive. Tous les membres seront retirés et l&apos;historique des messages sera perdu.
            </p>
            {confirmError && <p className="font-body-md text-[13px] text-error mb-3">{confirmError}</p>}
            <div className="flex gap-sm">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 h-12 rounded-[14px] bg-surface-container-high text-on-surface font-headline-sm text-headline-sm hover:bg-surface-container-highest transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteCommunity}
                className="flex-1 h-12 rounded-[14px] bg-error text-on-error font-headline-sm text-headline-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? "Suppression…" : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
