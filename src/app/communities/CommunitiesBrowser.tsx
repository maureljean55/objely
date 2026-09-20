"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import GuardedActionLink from "@/components/home/GuardedActionLink";
import type { CommunityLastMessage, CommunityWithCount } from "@/lib/supabase/communities";
import { joinCommunity } from "@/lib/supabase/communities";

function formatMessageTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const isSameDay = date.toDateString() === now.toDateString();
  if (isSameDay) return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return "Hier";

  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function lastMessagePreview(last: CommunityLastMessage | undefined) {
  if (!last || !last.last_message_created_at) return null;
  const senderFirstName = last.last_message_sender_name?.split(" ")[0] || "Quelqu'un";
  const text = last.last_message_deleted_at
    ? "Message supprimé"
    : last.last_message_kind === "voice"
      ? "🎤 Note vocale"
      : last.last_message_body ?? "";
  return { senderFirstName, text, time: formatMessageTime(last.last_message_created_at) };
}

function CommunityCover({ community, size = 48 }: { community: CommunityWithCount; size?: number }) {
  return (
    <div
      className="relative shrink-0 rounded-2xl overflow-hidden flex items-center justify-center text-on-primary shadow-sm"
      style={{ width: size, height: size, background: community.cover_url ? undefined : "linear-gradient(135deg, #0058bc, #5952af)" }}
    >
      {community.cover_url ? (
        <Image alt={community.name} src={community.cover_url} fill sizes={`${size}px`} className="object-cover" />
      ) : (
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
          groups
        </span>
      )}
    </div>
  );
}

function MyCommunityRow({ community, last }: { community: CommunityWithCount; last: CommunityLastMessage | undefined }) {
  const preview = lastMessagePreview(last);
  return (
    <Link
      href={`/communities/${community.id}`}
      className="group p-3 rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all active:scale-[0.99] flex items-center gap-3"
    >
      <CommunityCover community={community} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h4 className="font-body-lg text-body-lg font-semibold text-on-surface truncate">{community.name}</h4>
          {preview && <span className="font-label-md text-[11px] text-on-surface-variant shrink-0">{preview.time}</span>}
        </div>
        {preview ? (
          <p className="font-body-md text-[13px] text-on-surface-variant truncate">
            <span className="font-medium text-on-surface">{preview.senderFirstName}:</span> {preview.text}
          </p>
        ) : (
          <p className="font-label-md text-[13px] text-on-surface-variant truncate">
            {community.member_count} {community.member_count > 1 ? "membres" : "membre"}
          </p>
        )}
      </div>
    </Link>
  );
}

function DiscoveryCard({
  community,
  authenticated,
  onJoined,
}: {
  community: CommunityWithCount;
  authenticated: boolean;
  onJoined: () => void;
}) {
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJoin = async () => {
    setIsJoining(true);
    setError(null);
    const { error: joinError } = await joinCommunity(community.id);
    setIsJoining(false);
    if (joinError) {
      setError("Impossible de rejoindre, réessayez.");
      return;
    }
    onJoined();
  };

  return (
    <div className="p-3 rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <Link href={`/communities/${community.id}`} className="flex items-center gap-3 min-w-0">
          <CommunityCover community={community} size={44} />
          <div className="min-w-0">
            <h4 className="font-body-lg text-body-lg font-semibold text-on-surface truncate">{community.name}</h4>
            <p className="font-label-md text-[11px] text-on-surface-variant truncate">
              {community.member_count} {community.member_count > 1 ? "membres" : "membre"}
              {community.ville_quartier ? ` · ${community.ville_quartier}` : ""}
            </p>
          </div>
        </Link>
        {authenticated ? (
          <button
            type="button"
            onClick={handleJoin}
            disabled={isJoining}
            className="shrink-0 h-8 px-4 rounded-full bg-surface-container-high text-primary font-label-md text-label-md font-semibold hover:bg-primary hover:text-on-primary active:scale-95 transition-all disabled:opacity-50"
          >
            {isJoining ? "…" : "Rejoindre"}
          </button>
        ) : (
          <GuardedActionLink
            href="/communities"
            authenticated={false}
            message="Connectez-vous pour rejoindre cette communauté."
            emoji="🤝"
            className="shrink-0 h-8 px-4 rounded-full bg-surface-container-high text-primary font-label-md text-label-md font-semibold hover:bg-primary hover:text-on-primary active:scale-95 transition-all"
          >
            Rejoindre
          </GuardedActionLink>
        )}
      </div>
      {community.description && <p className="font-body-md text-[13px] text-on-surface-variant">{community.description}</p>}
      {error && <p className="font-body-md text-[12px] text-error">{error}</p>}
    </div>
  );
}

export default function CommunitiesBrowser({
  allCommunities,
  myCommunities,
  lastMessages,
  myAvatarUrl,
  authenticated,
}: {
  allCommunities: CommunityWithCount[];
  myCommunities: CommunityWithCount[];
  lastMessages: CommunityLastMessage[];
  myAvatarUrl: string | null;
  authenticated: boolean;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const myIds = useMemo(() => new Set(myCommunities.map((c) => c.id)), [myCommunities]);
  const directory = useMemo(() => allCommunities.filter((c) => !myIds.has(c.id)), [allCommunities, myIds]);
  const lastMessageByCommunity = useMemo(() => new Map(lastMessages.map((m) => [m.community_id, m])), [lastMessages]);

  const visibleDirectory = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return directory;
    return directory.filter((c) => [c.name, c.ville_quartier, c.description].some((field) => field?.toLowerCase().includes(q)));
  }, [directory, query]);

  return (
    <div className="flex flex-col gap-lg">
      {/* Hero: page title, own avatar, subtitle */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Communautés</h2>
          {authenticated && (
            <Link href="/profile" className="relative shrink-0">
              <div className="w-10 h-10 rounded-full bg-surface-container-high overflow-hidden shadow-sm">
                {myAvatarUrl ? (
                  <Image alt="Mon profil" src={myAvatarUrl} width={40} height={40} className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined w-full h-full flex items-center justify-center text-on-surface-variant">
                    person
                  </span>
                )}
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-primary ring-2 ring-surface" />
            </Link>
          )}
        </div>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Échange, partage et retrouve des personnes qui te ressemblent.
        </p>
      </div>

      {/* Search + quick create */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px] pointer-events-none">
            search
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher une communauté..."
            className="w-full h-12 pl-11 pr-4 rounded-xl bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant/70 font-body-md text-body-md shadow-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        <GuardedActionLink
          href="/communities/new"
          authenticated={authenticated}
          message="Connectez-vous pour créer une communauté de déclarants."
          emoji="🤝"
          className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md active:scale-95 transition-transform shrink-0"
          style={{ background: "linear-gradient(135deg, #0058bc, #5952af)" }}
        >
          <span className="material-symbols-outlined text-[24px]">add</span>
        </GuardedActionLink>
      </div>

      {authenticated && myCommunities.length > 0 && (
        <section className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <h3 className="font-body-lg text-body-lg font-semibold text-on-surface">Mes communautés</h3>
            <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-primary font-label-md text-[11px] font-semibold">
              {myCommunities.length}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {myCommunities.map((community) => (
              <MyCommunityRow key={community.id} community={community} last={lastMessageByCommunity.get(community.id)} />
            ))}
          </div>
        </section>
      )}

      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h3 className="font-body-lg text-body-lg font-semibold text-on-surface">Découvrir</h3>
          <span className="font-label-md text-[11px] text-on-surface-variant">Suggestions</span>
        </div>

        {visibleDirectory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-xl text-center">
            <div
              className="w-16 h-16 mb-lg rounded-full flex items-center justify-center shadow-lg"
              style={{ background: "linear-gradient(135deg, #0058bc, #5952af)" }}
            >
              <span className="material-symbols-outlined text-white text-[30px]">groups</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-2">
              {allCommunities.length === 0 ? "Aucune communauté pour l'instant" : "Aucun résultat"}
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-sm">
              {allCommunities.length === 0
                ? "Soyez le premier à en créer une pour votre quartier ou votre ville !"
                : "Essayez un autre nom de ville ou de communauté."}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {visibleDirectory.map((community) => (
              <DiscoveryCard
                key={community.id}
                community={community}
                authenticated={authenticated}
                onJoined={() => router.refresh()}
              />
            ))}
          </div>
        )}
      </section>

      <GuardedActionLink
        href="/communities/new"
        authenticated={authenticated}
        message="Connectez-vous pour créer une communauté de déclarants."
        emoji="🤝"
        className="w-full flex items-center justify-center gap-2 py-4 rounded-full text-white font-headline-sm text-headline-sm shadow-[0px_10px_30px_rgba(0,88,188,0.25)] hover:opacity-90 transition-opacity"
        style={{ background: "linear-gradient(135deg, #0058bc, #5952af)" }}
      >
        <span className="material-symbols-outlined">group_add</span>
        Créer une communauté
      </GuardedActionLink>
    </div>
  );
}
