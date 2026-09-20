"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import type { CommunityMember, CommunityMessage } from "@/lib/supabase/communities";

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

type Props = {
  communityName: string;
  communityCoverUrl: string | null;
  memberCount: number;
  currentUserId: string;
  isOwner: boolean;
  members: CommunityMember[];
  messages: CommunityMessage[];
  onSend: (body: string) => Promise<boolean>;
  onBack: () => void;
  onLeave: () => Promise<boolean>;
  onDeleteCommunity: () => Promise<boolean>;
  /** Adds a member by their public ID. Resolves to an error message to show, or null on success. */
  onAddMember: (publicId: string) => Promise<string | null>;
  /** Removes a member. Resolves to an error message to show, or null on success. */
  onRemoveMember: (userId: string) => Promise<string | null>;
};

/** WhatsApp-style group chat: unlike ChatThread (built for exactly two parties), every
 * bubble here resolves its sender against the full member list, since any of N people
 * might have sent it. */
export default function CommunityChatThread({
  communityName,
  communityCoverUrl,
  memberCount,
  currentUserId,
  isOwner,
  members,
  messages,
  onSend,
  onBack,
  onLeave,
  onDeleteCommunity,
  onAddMember,
  onRemoveMember,
}: Props) {
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showMembersSheet, setShowMembersSheet] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAddMemberSheet, setShowAddMemberSheet] = useState(false);
  const [addMemberInput, setAddMemberInput] = useState("");
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [addMemberError, setAddMemberError] = useState<string | null>(null);
  const [memberAdded, setMemberAdded] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<CommunityMember | null>(null);
  const [isRemovingMember, setIsRemovingMember] = useState(false);
  const [removeError, setRemoveError] = useState<string | null>(null);
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

  const handleAddMemberSubmit = async () => {
    const publicId = addMemberInput.trim().toUpperCase();
    if (!/^[A-Z0-9]{7}$/.test(publicId)) {
      setAddMemberError("Entrez les 7 caractères de l'identifiant.");
      return;
    }
    setIsAddingMember(true);
    setAddMemberError(null);
    const error = await onAddMember(publicId);
    setIsAddingMember(false);
    if (error) {
      setAddMemberError(error);
      return;
    }
    setShowAddMemberSheet(false);
    setAddMemberInput("");
    setMemberAdded(true);
    setTimeout(() => setMemberAdded(false), 2000);
  };

  const handleRemoveMemberConfirm = async () => {
    if (!removeTarget) return;
    setIsRemovingMember(true);
    setRemoveError(null);
    const error = await onRemoveMember(removeTarget.user_id);
    setIsRemovingMember(false);
    if (error) {
      setRemoveError(error);
      return;
    }
    setRemoveTarget(null);
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

        <button type="button" onClick={() => setShowMembersSheet(true)} className="flex items-center gap-2 min-w-0">
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
        </button>

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
                {isOwner && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      setShowAddMemberSheet(true);
                    }}
                    className="w-full py-3 px-3.5 flex items-center gap-3.5 rounded-[14px] text-on-surface font-body-md text-body-md hover:bg-surface-variant/50 active:bg-surface-variant/70 transition-colors"
                  >
                    <span className="w-5 flex justify-center shrink-0 text-on-surface-variant">
                      <span className="material-symbols-outlined text-[20px]">person_add</span>
                    </span>
                    Ajouter des membres
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    setShowMembersSheet(true);
                  }}
                  className="w-full py-3 px-3.5 flex items-center gap-3.5 rounded-[14px] text-on-surface font-body-md text-body-md hover:bg-surface-variant/50 active:bg-surface-variant/70 transition-colors"
                >
                  <span className="w-5 flex justify-center shrink-0 text-on-surface-variant">
                    <span className="material-symbols-outlined text-[20px]">groups</span>
                  </span>
                  Voir les membres
                </button>

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

      <main className="min-h-screen px-container-margin py-md pt-[calc(92px+env(safe-area-inset-top))] pb-[120px] flex flex-col gap-md">
        {messages.length === 0 && (
          <p className="font-body-md text-body-md text-on-surface-variant text-center">
            Aucun message pour le moment. Lancez la discussion !
          </p>
        )}

        {messages.map((message) => {
          const isMine = message.sender_id === currentUserId;
          const isDeleted = !!message.deleted_at;
          const name = nameFor(message.sender_id);
          return (
            <div key={message.id} className={`flex gap-2 max-w-[85%] ${isMine ? "self-end flex-row-reverse" : "self-start"}`}>
              {!isMine && <MemberAvatar name={name} avatarUrl={avatarFor(message.sender_id)} />}
              <div className="flex flex-col gap-1 min-w-0">
                {!isMine && (
                  <span className="font-label-md text-[11px] font-semibold text-primary px-1">{name}</span>
                )}
                <div
                  className={`rounded-2xl px-4 py-2.5 shadow-sm ${
                    isDeleted
                      ? "bg-surface-container-high text-on-surface-variant italic"
                      : isMine
                        ? "message-out text-on-primary text-right"
                        : "bg-surface-container message-in text-on-surface"
                  }`}
                >
                  <p className="font-body-md text-body-md whitespace-pre-wrap">
                    {isDeleted ? "Message supprimé" : message.body}
                  </p>
                </div>
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

      {showMembersSheet && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/30 backdrop-blur-sm"
          onClick={() => setShowMembersSheet(false)}
        >
          <div
            className="w-full sm:w-[400px] max-h-[70vh] overflow-y-auto bg-surface-container-lowest rounded-t-[28px] sm:rounded-[28px] p-lg pb-8 sm:pb-lg shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-lg gap-3">
              <h2 className="font-headline-md text-headline-md text-on-surface">
                {memberCount} {memberCount > 1 ? "membres" : "membre"}
              </h2>
              {isOwner && (
                <button
                  type="button"
                  onClick={() => {
                    setShowMembersSheet(false);
                    setShowAddMemberSheet(true);
                  }}
                  className="shrink-0 flex items-center gap-1.5 py-2 px-3.5 rounded-full bg-primary/10 text-primary font-label-md text-label-md font-semibold hover:bg-primary/15 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">person_add</span>
                  Ajouter
                </button>
              )}
            </div>
            <div className="flex flex-col gap-3">
              {members.map((member) => (
                <div key={member.user_id} className="flex items-center gap-3">
                  <MemberAvatar name={member.full_name || "Utilisateur Objely"} avatarUrl={member.avatar_url} size={40} />
                  <div className="min-w-0 flex-1">
                    <p className="font-body-md text-body-md text-on-surface truncate">{member.full_name || "Utilisateur Objely"}</p>
                  </div>
                  {member.role === "owner" && (
                    <span className="font-label-md text-[11px] text-primary bg-primary/10 px-2 py-1 rounded-full shrink-0">Propriétaire</span>
                  )}
                  {isOwner && member.role !== "owner" && member.user_id !== currentUserId && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowMembersSheet(false);
                        setRemoveTarget(member);
                      }}
                      aria-label={`Retirer ${member.full_name || "ce membre"}`}
                      className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-error hover:bg-error-container/30 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">person_remove</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
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

      {removeTarget && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/30 backdrop-blur-sm"
          onClick={() => !isRemovingMember && setRemoveTarget(null)}
        >
          <div className="w-full sm:w-[400px] bg-surface-container-lowest rounded-t-[28px] sm:rounded-[28px] p-lg pb-8 sm:pb-lg shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-headline-md text-headline-md text-on-surface mb-1">
              Retirer {removeTarget.full_name || "ce membre"} ?
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mb-lg">
              Cette personne ne fera plus partie de {communityName} et ne recevra plus les messages du groupe.
            </p>
            {removeError && <p className="font-body-md text-[13px] text-error mb-3">{removeError}</p>}
            <div className="flex gap-sm">
              <button
                type="button"
                disabled={isRemovingMember}
                onClick={() => setRemoveTarget(null)}
                className="flex-1 h-12 rounded-[14px] bg-surface-container-high text-on-surface font-headline-sm text-headline-sm hover:bg-surface-container-highest transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={isRemovingMember}
                onClick={handleRemoveMemberConfirm}
                className="flex-1 h-12 rounded-[14px] bg-error text-on-error font-headline-sm text-headline-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRemovingMember ? "Retrait…" : "Retirer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddMemberSheet && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/30 backdrop-blur-sm"
          onClick={() => !isAddingMember && setShowAddMemberSheet(false)}
        >
          <div
            className="w-full sm:w-[400px] bg-surface-container-lowest rounded-t-[28px] sm:rounded-[28px] p-lg pb-8 sm:pb-lg shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-headline-md text-headline-md text-on-surface mb-1">Ajouter un membre</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mb-lg">
              Entrez le code à 7 caractères affiché sur la page de profil de cette personne.
            </p>
            <div className="flex items-center gap-2 bg-surface-container-low rounded-2xl border border-outline-variant/30 px-4 h-14 focus-within:border-primary transition-colors">
              <span className="font-headline-sm text-headline-sm text-on-surface-variant shrink-0">@</span>
              <input
                type="text"
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck={false}
                autoFocus
                maxLength={7}
                value={addMemberInput}
                onChange={(e) => {
                  setAddMemberInput(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 7));
                  setAddMemberError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddMemberSubmit();
                  }
                }}
                placeholder="K7M2PQD"
                className="w-full bg-transparent border-none p-0 focus:ring-0 font-mono text-body-lg tracking-[0.2em] text-on-surface placeholder-outline"
              />
            </div>
            {addMemberError && <p className="font-body-md text-[13px] text-error mt-3">{addMemberError}</p>}
            <div className="flex gap-sm mt-lg">
              <button
                type="button"
                disabled={isAddingMember}
                onClick={() => setShowAddMemberSheet(false)}
                className="flex-1 h-12 rounded-[14px] bg-surface-container-high text-on-surface font-headline-sm text-headline-sm hover:bg-surface-container-highest transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={isAddingMember || addMemberInput.length !== 7}
                onClick={handleAddMemberSubmit}
                className="flex-1 h-12 rounded-[14px] bg-primary text-on-primary font-headline-sm text-headline-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAddingMember ? "Ajout…" : "Ajouter"}
              </button>
            </div>
          </div>
        </div>
      )}

      {memberAdded && (
        <div className="fixed bottom-[100px] inset-x-0 z-[110] flex justify-center pointer-events-none">
          <div className="flex items-center gap-2 bg-inverse-surface text-inverse-on-surface px-4 py-2.5 rounded-full shadow-lg animate-popIn">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span className="font-label-md text-label-md">Membre ajouté !</span>
          </div>
        </div>
      )}
    </div>
  );
}
