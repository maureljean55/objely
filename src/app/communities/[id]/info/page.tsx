"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getCurrentUser } from "@/lib/auth";
import {
  addCommunityMemberByPublicId,
  getCommunity,
  getCommunitySharedItemsCount,
  getMyMembership,
  listCommunityJoinRequests,
  listCommunityMembers,
  removeCommunityMember,
  respondToJoinRequest,
  type CommunityJoinRequest,
  type CommunityMember,
  type CommunityWithCount,
} from "@/lib/supabase/communities";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function MemberAvatar({ name, avatarUrl, size = 44 }: { name: string; avatarUrl: string | null; size?: number }) {
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

export default function CommunityInfoPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const communityId = params.id;

  const [community, setCommunity] = useState<CommunityWithCount | null | undefined>(undefined);
  const [isOwner, setIsOwner] = useState(false);
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [joinRequests, setJoinRequests] = useState<CommunityJoinRequest[]>([]);
  const [sharedItemsCount, setSharedItemsCount] = useState(0);
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState(false);

  const [showAddMemberSheet, setShowAddMemberSheet] = useState(false);
  const [addMemberInput, setAddMemberInput] = useState("");
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [addMemberError, setAddMemberError] = useState<string | null>(null);

  const [removeTarget, setRemoveTarget] = useState<CommunityMember | null>(null);
  const [isRemovingMember, setIsRemovingMember] = useState(false);
  const [removeError, setRemoveError] = useState<string | null>(null);

  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [joinRequestsError, setJoinRequestsError] = useState<string | null>(null);

  const loadAll = async (owner: boolean) => {
    const [{ data: memberList }, { data: requests }, { data: count }] = await Promise.all([
      listCommunityMembers(communityId),
      owner ? listCommunityJoinRequests(communityId) : Promise.resolve({ data: [] as CommunityJoinRequest[] }),
      getCommunitySharedItemsCount(communityId),
    ]);
    setMembers(memberList ?? []);
    setJoinRequests(requests ?? []);
    setSharedItemsCount(count);
  };

  useEffect(() => {
    (async () => {
      const [user, { data: communityData }] = await Promise.all([getCurrentUser(), getCommunity(communityId)]);
      setCommunity(communityData ?? null);
      if (!communityData || !user) return;

      const { data: myMembership } = await getMyMembership(communityId);
      if (!myMembership) {
        router.replace(`/communities/${communityId}`);
        return;
      }
      const owner = myMembership.role === "owner";
      setIsOwner(owner);
      await loadAll(owner);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [communityId]);

  const visibleMembers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members;
    return members.filter((m) => (m.full_name || "").toLowerCase().includes(q));
  }, [members, query]);

  const handleCopyInvite = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/communities/${communityId}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can be denied by the browser — nothing useful to do beyond leaving the link unselected.
    }
  };

  const handleAddMemberSubmit = async () => {
    const publicId = addMemberInput.trim().toUpperCase();
    if (!/^[A-Z0-9]{7}$/.test(publicId)) {
      setAddMemberError("Entrez les 7 caractères de l'identifiant.");
      return;
    }
    setIsAddingMember(true);
    setAddMemberError(null);
    const { error } = await addCommunityMemberByPublicId(communityId, publicId);
    setIsAddingMember(false);
    if (error) {
      setAddMemberError(error);
      return;
    }
    setShowAddMemberSheet(false);
    setAddMemberInput("");
    await loadAll(isOwner);
  };

  const handleRemoveMemberConfirm = async () => {
    if (!removeTarget) return;
    setIsRemovingMember(true);
    setRemoveError(null);
    const { error } = await removeCommunityMember(communityId, removeTarget.user_id);
    setIsRemovingMember(false);
    if (error) {
      setRemoveError("Impossible de retirer ce membre, réessayez.");
      return;
    }
    setRemoveTarget(null);
    await loadAll(isOwner);
  };

  const handleRespondToJoinRequest = async (requestId: string, approve: boolean) => {
    setRespondingId(requestId);
    setJoinRequestsError(null);
    const { error } = await respondToJoinRequest(requestId, approve);
    setRespondingId(null);
    if (error) {
      setJoinRequestsError("Impossible de traiter cette demande, réessayez.");
      return;
    }
    await loadAll(isOwner);
  };

  if (community === undefined) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <span className="w-8 h-8 border-4 border-primary-container/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (community === null) {
    return (
      <div className="bg-background text-on-background antialiased min-h-screen flex flex-col items-center justify-center px-container-margin text-center">
        <p className="font-body-md text-body-md text-on-surface-variant">Communauté introuvable.</p>
        <button type="button" onClick={() => router.push("/communities")} className="text-primary font-semibold mt-4">
          Retour aux communautés
        </button>
      </div>
    );
  }

  return (
    <div className="bg-background text-on-surface antialiased min-h-screen pb-24">
      <header className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-container-margin min-h-14 pt-[env(safe-area-inset-top)] bg-surface/80 backdrop-blur-xl border-b border-outline-variant/30">
        <button
          type="button"
          onClick={() => router.push(`/communities/${communityId}`)}
          aria-label="Retour"
          className="w-10 h-10 flex items-center justify-center text-primary hover:opacity-70 transition-opacity active:scale-95"
        >
          <span className="material-symbols-outlined">arrow_back_ios</span>
        </button>
        <h1 className="font-headline-sm text-headline-sm text-on-surface absolute left-1/2 -translate-x-1/2">Informations et membres</h1>
        <div className="w-10 h-10" />
      </header>

      <main className="max-w-[800px] mx-auto pt-[calc(5rem+env(safe-area-inset-top))] pb-8 px-container-margin flex flex-col gap-lg">
        <section className="bg-surface-container-lowest rounded-[24px] p-lg shadow-sm flex flex-col items-center text-center gap-2">
          <div className="relative w-20 h-20 rounded-[24px] overflow-hidden bg-surface-container-high text-on-surface-variant flex items-center justify-center mb-1 shrink-0">
            {community.cover_url ? (
              <Image alt={community.name} src={community.cover_url} fill sizes="80px" className="object-cover" />
            ) : (
              <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                groups
              </span>
            )}
          </div>
          <h2 className="font-headline-md text-headline-md text-on-surface">{community.name}</h2>
          <p className="font-label-md text-label-md text-on-surface-variant flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">{community.is_private ? "lock" : "public"}</span>
            {community.is_private ? "Communauté privée" : "Communauté publique"} · {community.member_count}{" "}
            {community.member_count > 1 ? "membres" : "membre"}
          </p>
          {community.description && <p className="font-body-md text-body-md text-on-surface-variant">{community.description}</p>}

          <div className="flex items-center gap-2 w-full mt-2">
            <button
              type="button"
              onClick={handleCopyInvite}
              className="flex-1 h-11 rounded-full bg-surface-container-high text-primary font-label-md text-label-md font-semibold flex items-center justify-center gap-1.5 hover:bg-surface-container-highest transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">{copied ? "check" : "link"}</span>
              {copied ? "Lien copié" : "Inviter"}
            </button>
            {isOwner && (
              <button
                type="button"
                onClick={() => setShowAddMemberSheet(true)}
                className="flex-1 h-11 rounded-full text-white font-label-md text-label-md font-semibold flex items-center justify-center gap-1.5"
                style={{ background: "linear-gradient(135deg, #0058bc, #5952af)" }}
              >
                <span className="material-symbols-outlined text-[18px]">person_add</span>
                Ajouter
              </button>
            )}
          </div>
        </section>

        {isOwner && joinRequests.length > 0 && (
          <section className="flex flex-col gap-2">
            <h3 className="font-body-lg text-body-lg font-semibold text-on-surface">Demandes en attente ({joinRequests.length})</h3>
            {joinRequestsError && <p className="font-body-md text-[13px] text-error">{joinRequestsError}</p>}
            <div className="bg-surface-container-lowest rounded-[20px] shadow-sm divide-y divide-outline-variant/20 overflow-hidden">
              {joinRequests.map((request) => (
                <div key={request.id} className="flex items-center gap-3 p-3">
                  <MemberAvatar name={request.full_name || "Utilisateur Objely"} avatarUrl={request.avatar_url} size={40} />
                  <p className="min-w-0 flex-1 font-body-md text-body-md text-on-surface truncate">
                    {request.full_name || "Utilisateur Objely"}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleRespondToJoinRequest(request.id, false)}
                    disabled={respondingId === request.id}
                    aria-label={`Refuser ${request.full_name || "cette demande"}`}
                    className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-error hover:bg-error-container/30 transition-colors disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRespondToJoinRequest(request.id, true)}
                    disabled={respondingId === request.id}
                    aria-label={`Accepter ${request.full_name || "cette demande"}`}
                    className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-primary text-on-primary hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[18px]">check</span>
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <h3 className="font-body-lg text-body-lg font-semibold text-on-surface">Membres</h3>
            <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-primary font-label-md text-[11px] font-semibold">
              {members.length}
            </span>
          </div>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px] pointer-events-none">
              search
            </span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un membre..."
              className="w-full h-12 pl-11 pr-4 rounded-xl bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant/70 font-body-md text-body-md shadow-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <div className="bg-surface-container-lowest rounded-[20px] shadow-sm divide-y divide-outline-variant/20 overflow-hidden">
            {visibleMembers.map((member) => (
              <div key={member.user_id} className="flex items-center gap-3 p-3">
                <MemberAvatar name={member.full_name || "Utilisateur Objely"} avatarUrl={member.avatar_url} />
                <div className="min-w-0 flex-1">
                  <p className="font-body-md text-body-md text-on-surface truncate">{member.full_name || "Utilisateur Objely"}</p>
                  <span
                    className={`inline-block mt-0.5 px-2 py-0.5 rounded-full font-label-md text-[11px] font-semibold ${
                      member.role === "owner" ? "bg-secondary/15 text-secondary" : "bg-surface-container-high text-on-surface-variant"
                    }`}
                  >
                    {member.role === "owner" ? "Administrateur" : "Membre"}
                  </span>
                </div>
                {isOwner && member.role !== "owner" && (
                  <button
                    type="button"
                    onClick={() => setRemoveTarget(member)}
                    aria-label={`Retirer ${member.full_name || "ce membre"}`}
                    className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-error hover:bg-error-container/30 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">person_remove</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        <Link
          href={`/communities/${communityId}/info/objects`}
          className="flex items-center gap-3 p-lg rounded-[20px] bg-surface-container-low shadow-sm hover:shadow-md transition-all"
        >
          <div className="w-11 h-11 rounded-xl bg-surface-container-lowest flex items-center justify-center text-secondary shrink-0 shadow-sm">
            <span className="material-symbols-outlined text-[22px]">inventory_2</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-body-lg text-body-lg font-semibold text-on-surface">Objets partagés</h3>
            <p className="font-label-md text-[13px] text-on-surface-variant">
              {sharedItemsCount} objet{sharedItemsCount > 1 ? "s" : ""} partagé{sharedItemsCount > 1 ? "s" : ""} dans ce groupe
            </p>
          </div>
          <span className="material-symbols-outlined text-outline-variant shrink-0">chevron_right</span>
        </Link>
      </main>

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

      {removeTarget && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/30 backdrop-blur-sm"
          onClick={() => !isRemovingMember && setRemoveTarget(null)}
        >
          <div className="w-full sm:w-[400px] bg-surface-container-lowest rounded-t-[28px] sm:rounded-[28px] p-lg pb-8 sm:pb-lg shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-headline-md text-headline-md text-on-surface mb-1">Retirer {removeTarget.full_name || "ce membre"} ?</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mb-lg">
              Cette personne ne fera plus partie de {community.name} et ne recevra plus les messages du groupe.
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
    </div>
  );
}
