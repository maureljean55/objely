"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  deleteMessage,
  editMessage,
  getMatch,
  listMessages,
  sendMessage,
  sendVoiceMessage,
  type MatchWithItems,
  type Message,
} from "@/lib/supabase/messages";
import { uploadVoiceNote } from "@/lib/supabase/voiceNotes";
import ChatThread, { type ChatMessage } from "@/components/ChatThread";

type OtherProfile = { full_name: string | null; avatar_url: string | null };

export default function SecureChatPage() {
  const router = useRouter();
  const params = useParams<{ matchId: string }>();
  const matchId = params.matchId;

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [match, setMatch] = useState<MatchWithItems | null>(null);
  const [otherProfile, setOtherProfile] = useState<OtherProfile>({ full_name: null, avatar_url: null });
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    (async () => {
      // Neither call depends on the other's result, so run them together
      // instead of waiting for auth before even starting the match fetch.
      const [{ data: sessionData }, { data: matchData, error: matchErr }] = await Promise.all([
        supabase.auth.getSession(),
        getMatch(matchId),
      ]);
      const user = sessionData.session?.user ?? null;
      if (!user || matchErr || !matchData) {
        setLoadError(true);
        return;
      }
      setCurrentUserId(user.id);
      setMatch(matchData);

      const isLostSide = matchData.lost_item.user_id === user.id;
      const otherUserId = isLostSide ? matchData.found_item.user_id : matchData.lost_item.user_id;

      // Same here: the other party's profile and the message history are
      // independent of each other.
      const [{ data: profile }, { data: messageData }] = await Promise.all([
        supabase.from("profiles").select("full_name, avatar_url").eq("id", otherUserId).maybeSingle<OtherProfile>(),
        listMessages(matchId),
      ]);
      if (profile) setOtherProfile(profile);
      setMessages(messageData ?? []);
    })();
  }, [matchId]);

  // Without this, a new message (or an edit/delete) only ever showed up for
  // whoever sent it — the other participant had no way to know until they
  // reloaded the page.
  useEffect(() => {
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;

    (async () => {
      // Realtime's own websocket auth doesn't always pick up the session
      // restored from cookies in time for the first subscribe — setting it
      // explicitly guarantees the RLS check on messages (match participants
      // only) actually passes for this connection.
      const { data: { session } } = await supabase.auth.getSession();
      if (cancelled || !session) return;
      supabase.realtime.setAuth(session.access_token);

      channel = supabase
        .channel(`messages:${matchId}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "messages", filter: `match_id=eq.${matchId}` },
          (payload) => {
            const incoming = payload.new as Message;
            setMessages((prev) => (prev.some((m) => m.id === incoming.id) ? prev : [...prev, incoming]));
          },
        )
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "messages", filter: `match_id=eq.${matchId}` },
          (payload) => {
            const updated = payload.new as Message;
            setMessages((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
          },
        )
        .subscribe();
    })();

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, [matchId]);

  const handleSend = async (body: string, replyToId: string | null) => {
    const { data, error } = await sendMessage(matchId, body, replyToId);
    if (!error && data) {
      setMessages((prev) => [...prev, data]);
      return true;
    }
    return false;
  };

  const handleSendVoice = async (blob: Blob, replyToId: string | null) => {
    const { url, error: uploadError } = await uploadVoiceNote(blob);
    if (uploadError || !url) return false;
    const { data, error } = await sendVoiceMessage(matchId, url, replyToId);
    if (!error && data) {
      setMessages((prev) => [...prev, data]);
      return true;
    }
    return false;
  };

  const handleEdit = async (messageId: string, body: string) => {
    const { data, error } = await editMessage(messageId, body);
    if (!error && data) {
      setMessages((prev) => prev.map((m) => (m.id === messageId ? data : m)));
      return true;
    }
    return false;
  };

  const handleDelete = async (messageId: string) => {
    const { data, error } = await deleteMessage(messageId);
    if (!error && data) {
      setMessages((prev) => prev.map((m) => (m.id === messageId ? data : m)));
      return true;
    }
    return false;
  };

  if (loadError) {
    return (
      <div className="bg-background text-on-background antialiased min-h-screen flex flex-col items-center justify-center px-container-margin text-center">
        <p className="font-body-md text-body-md text-on-surface-variant">Conversation introuvable.</p>
        <button type="button" onClick={() => router.push("/activity")} className="text-primary font-semibold mt-4">
          Retour à l&apos;activité
        </button>
      </div>
    );
  }

  // The message thread only opens once the finder has confirmed the
  // owner's verification answers — before that, neither side has "le droit
  // d'écrire" yet.
  if (match && match.status !== "confirmed") {
    return (
      <div className="bg-background text-on-background antialiased min-h-screen flex flex-col items-center justify-center px-container-margin text-center gap-2">
        <div className="w-14 h-14 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center mb-2">
          <span className="material-symbols-outlined text-[26px]">lock_clock</span>
        </div>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-sm">
          {match.status === "rejected"
            ? "Cette correspondance a été refusée, la conversation n'est pas disponible."
            : "La conversation s'ouvrira une fois la vérification de propriété confirmée."}
        </p>
        <button type="button" onClick={() => router.push("/activity")} className="text-primary font-semibold mt-2">
          Retour à l&apos;activité
        </button>
      </div>
    );
  }

  const chatMessages: ChatMessage[] = messages.map((m) => ({
    id: m.id,
    senderId: m.sender_id,
    kind: m.kind,
    body: m.body,
    voiceUrl: m.voice_url,
    editedAt: m.edited_at,
    deletedAt: m.deleted_at,
    createdAt: m.created_at,
    replyToId: m.reply_to_id,
  }));

  return (
    <ChatThread
      peerName={otherProfile.full_name || "Utilisateur Objely"}
      peerAvatarUrl={otherProfile.avatar_url}
      currentUserId={currentUserId}
      messages={chatMessages}
      onSend={handleSend}
      onSendVoice={handleSendVoice}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onBack={() => router.back()}
    />
  );
}
