"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { getCurrentUser } from "@/lib/auth";
import GuardedActionLink from "@/components/home/GuardedActionLink";
import CommunityChatThread from "@/components/CommunityChatThread";
import { getItem, listMyItems, type Item } from "@/lib/supabase/items";
import {
  deleteCommunity,
  getCommunity,
  getMyMembership,
  hasPendingJoinRequest,
  leaveCommunity,
  listCommunityMembers,
  listCommunityMessages,
  markCommunityRead,
  requestJoinCommunity,
  sendCommunityItemShare,
  sendCommunityMessage,
  toggleCommunityMessageReaction,
  type CommunityMember,
  type CommunityMessage,
  type CommunityMessageReaction,
  type CommunityWithCount,
} from "@/lib/supabase/communities";

/** Realtime's postgres_changes payload is the raw row — no PostgREST embeds
 * — so an item_share message that arrives (or comes back from the send
 * RPC) needs its shared item fetched separately before it can render. */
async function enrichMessage(message: CommunityMessage): Promise<CommunityMessage> {
  if (message.kind !== "item_share" || message.shared_item || !message.shared_item_id) {
    return { ...message, reactions: message.reactions ?? [] };
  }
  const { data: item } = await getItem(message.shared_item_id);
  return {
    ...message,
    reactions: message.reactions ?? [],
    shared_item: item
      ? {
          id: item.id,
          type: item.type,
          status: item.status,
          title: item.title,
          category_icon: item.category_icon,
          photos: item.photos,
          location: item.location,
          occurred_on: item.occurred_on,
          deleted_at: item.deleted_at,
        }
      : null,
  };
}

export default function CommunityPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const communityId = params.id;

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [community, setCommunity] = useState<CommunityWithCount | null | undefined>(undefined);
  const [membership, setMembership] = useState<{ role: "owner" | "member" } | null>(null);
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [myItems, setMyItems] = useState<Item[]>([]);
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joinRequested, setJoinRequested] = useState(false);

  const isMember = !!membership;
  const isOwner = membership?.role === "owner";

  const loadMemberData = async () => {
    const [{ data: memberList }, { data: messageList }, { data: itemList }] = await Promise.all([
      listCommunityMembers(communityId),
      listCommunityMessages(communityId),
      listMyItems(),
    ]);
    setMembers(memberList ?? []);
    setMessages(messageList ?? []);
    setMyItems(itemList ?? []);
  };

  useEffect(() => {
    (async () => {
      const [user, { data: communityData }] = await Promise.all([getCurrentUser(), getCommunity(communityId)]);
      setCurrentUserId(user?.id ?? null);
      setCommunity(communityData ?? null);
      if (!communityData) return;

      const { data: myMembership } = await getMyMembership(communityId);
      setMembership(myMembership);
      if (myMembership) {
        await loadMemberData();
        await markCommunityRead(communityId);
      } else if (user) {
        const { data: pending } = await hasPendingJoinRequest(communityId);
        setJoinRequested(!!pending);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [communityId]);

  // Realtime group chat — same pattern as src/app/dm/[conversationId]/page.tsx:
  // explicitly set Realtime's websocket auth before subscribing (it doesn't
  // reliably pick up the cookie-restored session in time otherwise), scope
  // the channel to this community, and merge new rows into local state.
  useEffect(() => {
    if (!isMember) return;
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;

    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (cancelled || !session) return;
      supabase.realtime.setAuth(session.access_token);

      channel = supabase
        .channel(`community_messages:${communityId}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "community_messages", filter: `community_id=eq.${communityId}` },
          (payload) => {
            const incoming = payload.new as CommunityMessage;
            setMessages((prev) => {
              if (prev.some((m) => m.id === incoming.id)) return prev;
              return [...prev, { ...incoming, reactions: [] }];
            });
            if (incoming.kind === "item_share") {
              enrichMessage(incoming).then((full) => {
                setMessages((prev) => prev.map((m) => (m.id === full.id ? { ...full, reactions: m.reactions } : m)));
              });
            }
          },
        )
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "community_message_reactions" },
          (payload) => {
            const reaction = payload.new as CommunityMessageReaction & { message_id: string };
            setMessages((prev) =>
              prev.map((m) =>
                m.id === reaction.message_id && !m.reactions.some((r) => r.user_id === reaction.user_id && r.emoji === reaction.emoji)
                  ? { ...m, reactions: [...m.reactions, { user_id: reaction.user_id, emoji: reaction.emoji }] }
                  : m,
              ),
            );
          },
        )
        .on(
          "postgres_changes",
          { event: "DELETE", schema: "public", table: "community_message_reactions" },
          (payload) => {
            const reaction = payload.old as CommunityMessageReaction & { message_id: string };
            setMessages((prev) =>
              prev.map((m) =>
                m.id === reaction.message_id
                  ? { ...m, reactions: m.reactions.filter((r) => !(r.user_id === reaction.user_id && r.emoji === reaction.emoji)) }
                  : m,
              ),
            );
          },
        )
        .subscribe();
    })();

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, [communityId, isMember]);

  const refreshCommunity = async () => {
    const { data } = await getCommunity(communityId);
    if (data) setCommunity(data);
  };

  const handleJoin = async () => {
    setIsJoining(true);
    setJoinError(null);
    const { status, error } = await requestJoinCommunity(communityId);
    setIsJoining(false);
    if (error || !status) {
      setJoinError("Impossible de rejoindre la communauté, réessayez.");
      return;
    }
    if (status === "requested") {
      setJoinRequested(true);
      return;
    }
    setMembership({ role: "member" });
    await Promise.all([loadMemberData(), refreshCommunity()]);
    await markCommunityRead(communityId);
  };

  const handleSend = async (body: string) => {
    const { data, error } = await sendCommunityMessage(communityId, body);
    if (!error && data) {
      setMessages((prev) => [...prev, { ...data, reactions: [] }]);
      return true;
    }
    return false;
  };

  const handleShareItem = async (itemId: string) => {
    const { data, error } = await sendCommunityItemShare(communityId, itemId);
    if (error || !data) return false;
    const full = await enrichMessage(data);
    setMessages((prev) => (prev.some((m) => m.id === full.id) ? prev : [...prev, full]));
    return true;
  };

  const handleToggleReaction = async (messageId: string, emoji: string) => {
    if (!currentUserId) return;
    // Optimistic: toggle locally first, since the realtime echo of our own
    // write arrives a beat later and a visible delay on your own tap reads
    // as broken, not just slow.
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== messageId) return m;
        const already = m.reactions.some((r) => r.user_id === currentUserId && r.emoji === emoji);
        return {
          ...m,
          reactions: already
            ? m.reactions.filter((r) => !(r.user_id === currentUserId && r.emoji === emoji))
            : [...m.reactions, { user_id: currentUserId, emoji }],
        };
      }),
    );
    const { error } = await toggleCommunityMessageReaction(messageId, emoji);
    if (error) {
      // Roll back on failure by re-toggling.
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id !== messageId) return m;
          const already = m.reactions.some((r) => r.user_id === currentUserId && r.emoji === emoji);
          return {
            ...m,
            reactions: already
              ? m.reactions.filter((r) => !(r.user_id === currentUserId && r.emoji === emoji))
              : [...m.reactions, { user_id: currentUserId, emoji }],
          };
        }),
      );
    }
  };

  const handleLeave = async () => {
    const { error } = await leaveCommunity(communityId);
    if (error) return false;
    router.push("/communities");
    return true;
  };

  const handleDeleteCommunity = async () => {
    const { error } = await deleteCommunity(communityId, community?.cover_url);
    if (error) return false;
    router.push("/communities");
    return true;
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

  if (isMember && currentUserId) {
    return (
      <CommunityChatThread
        communityId={communityId}
        communityName={community.name}
        communityCoverUrl={community.cover_url}
        memberCount={community.member_count}
        currentUserId={currentUserId}
        isOwner={isOwner}
        members={members}
        messages={messages}
        myItems={myItems}
        onSend={handleSend}
        onShareItem={handleShareItem}
        onToggleReaction={handleToggleReaction}
        onBack={() => router.push("/communities")}
        onLeave={handleLeave}
        onDeleteCommunity={handleDeleteCommunity}
      />
    );
  }

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col items-center justify-center px-container-margin text-center gap-3">
      <div className="relative w-24 h-24 rounded-[28px] overflow-hidden bg-surface-container-highest text-on-surface-variant flex items-center justify-center mb-2 shrink-0">
        {community.cover_url ? (
          <Image alt={community.name} src={community.cover_url} fill sizes="96px" className="object-cover" />
        ) : (
          <span className="material-symbols-outlined text-[40px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            groups
          </span>
        )}
      </div>
      <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">{community.name}</h1>
      <div className="flex items-center gap-2 flex-wrap justify-center">
        {community.ville_quartier && (
          <span className="flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1.5 rounded-full font-label-md text-label-md">
            <span className="material-symbols-outlined text-[16px]">location_on</span>
            {community.ville_quartier}
          </span>
        )}
        {community.is_private && (
          <span className="flex items-center gap-1.5 bg-surface-container-high text-on-surface-variant px-3 py-1.5 rounded-full font-label-md text-label-md">
            <span className="material-symbols-outlined text-[16px]">lock</span>
            Privée
          </span>
        )}
      </div>
      <p className="font-body-md text-body-md text-on-surface-variant max-w-xs">
        {community.description || "Rejoignez cette communauté pour échanger avec les autres déclarants."}
      </p>
      <p className="font-label-md text-label-md text-outline">
        {community.member_count} {community.member_count > 1 ? "membres" : "membre"}
      </p>

      {joinError && <p className="font-body-md text-[13px] text-error">{joinError}</p>}

      {currentUserId ? (
        joinRequested ? (
          <span className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-surface-container-high text-on-surface-variant font-headline-sm text-headline-sm mt-2">
            <span className="material-symbols-outlined text-[20px]">hourglass_top</span>
            Demande envoyée
          </span>
        ) : (
          <button
            type="button"
            onClick={handleJoin}
            disabled={isJoining}
            className="btn-gradient px-6 py-3 rounded-2xl bg-primary text-on-primary font-headline-sm text-headline-sm shadow-[0px_10px_30px_rgba(0,88,188,0.25)] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {isJoining ? "…" : community.is_private ? "Demander à rejoindre" : "Rejoindre"}
          </button>
        )
      ) : (
        <GuardedActionLink
          href="/communities"
          authenticated={false}
          message="Connectez-vous pour rejoindre cette communauté."
          emoji="🤝"
          className="btn-gradient px-6 py-3 rounded-2xl bg-primary text-on-primary font-headline-sm text-headline-sm shadow-[0px_10px_30px_rgba(0,88,188,0.25)] hover:opacity-90 transition-opacity mt-2"
        >
          Rejoindre
        </GuardedActionLink>
      )}
    </div>
  );
}
