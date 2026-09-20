"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  deleteDirectMessage,
  editDirectMessage,
  getDirectConversationPeer,
  listDirectMessages,
  sendAttachmentDirectMessage,
  sendDirectMessage,
  sendVoiceDirectMessage,
  type ConversationPeer,
  type DirectMessage,
} from "@/lib/supabase/directMessages";
import { uploadVoiceNote } from "@/lib/supabase/voiceNotes";
import { uploadMessageFile, uploadMessageImage } from "@/lib/supabase/messageAttachments";
import ChatThread, { type ChatMessage } from "@/components/ChatThread";

export default function DirectMessagePage() {
  const router = useRouter();
  const params = useParams<{ conversationId: string }>();
  const conversationId = params.conversationId;

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [peer, setPeer] = useState<ConversationPeer | null>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    (async () => {
      const [{ data: sessionData }, { data: peerData, error: peerErr }, { data: messageData }] = await Promise.all([
        supabase.auth.getSession(),
        getDirectConversationPeer(conversationId),
        listDirectMessages(conversationId),
      ]);
      const user = sessionData.session?.user ?? null;
      if (!user || peerErr || !peerData) {
        setLoadError(true);
        return;
      }
      setCurrentUserId(user.id);
      setPeer(peerData);
      setMessages(messageData ?? []);
    })();
  }, [conversationId]);

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
      // explicitly guarantees the RLS check on direct_messages (participants
      // only) actually passes for this connection.
      const { data: { session } } = await supabase.auth.getSession();
      if (cancelled || !session) return;
      supabase.realtime.setAuth(session.access_token);

      channel = supabase
        .channel(`direct_messages:${conversationId}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "direct_messages", filter: `conversation_id=eq.${conversationId}` },
          (payload) => {
            const incoming = payload.new as DirectMessage;
            setMessages((prev) => (prev.some((m) => m.id === incoming.id) ? prev : [...prev, incoming]));
          },
        )
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "direct_messages", filter: `conversation_id=eq.${conversationId}` },
          (payload) => {
            const updated = payload.new as DirectMessage;
            setMessages((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
          },
        )
        .subscribe();
    })();

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, [conversationId]);

  const handleSend = async (body: string, replyToId: string | null) => {
    const { data, error } = await sendDirectMessage(conversationId, body, replyToId);
    if (!error && data) {
      setMessages((prev) => [...prev, data]);
      return true;
    }
    return false;
  };

  const handleSendVoice = async (blob: Blob, replyToId: string | null) => {
    const { url, error: uploadError } = await uploadVoiceNote(blob);
    if (uploadError || !url) return false;
    const { data, error } = await sendVoiceDirectMessage(conversationId, url, replyToId);
    if (!error && data) {
      setMessages((prev) => [...prev, data]);
      return true;
    }
    return false;
  };

  const handleSendImage = async (file: File, replyToId: string | null) => {
    const { url, name, type, error: uploadError } = await uploadMessageImage(file);
    if (uploadError || !url || !name || !type) return false;
    const { data, error } = await sendAttachmentDirectMessage(conversationId, { url, name, type }, replyToId);
    if (!error && data) {
      setMessages((prev) => [...prev, data]);
      return true;
    }
    return false;
  };

  const handleSendFile = async (file: File, replyToId: string | null) => {
    const { url, name, type, error: uploadError } = await uploadMessageFile(file);
    if (uploadError || !url || !name || !type) return false;
    const { data, error } = await sendAttachmentDirectMessage(conversationId, { url, name, type }, replyToId);
    if (!error && data) {
      setMessages((prev) => [...prev, data]);
      return true;
    }
    return false;
  };

  const handleEdit = async (messageId: string, body: string) => {
    const { data, error } = await editDirectMessage(messageId, body);
    if (!error && data) {
      setMessages((prev) => prev.map((m) => (m.id === messageId ? data : m)));
      return true;
    }
    return false;
  };

  const handleDelete = async (messageId: string) => {
    const { data, error } = await deleteDirectMessage(messageId);
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
        <button type="button" onClick={() => router.push("/messages")} className="text-primary font-semibold mt-4">
          Retour aux messages
        </button>
      </div>
    );
  }

  if (!peer || !currentUserId) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <span className="w-8 h-8 border-4 border-primary-container/30 border-t-primary rounded-full animate-spin" />
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
    restitutionAppointmentId: null,
    attachmentUrl: m.attachment_url,
    attachmentName: m.attachment_name,
    attachmentType: m.attachment_type,
  }));

  return (
    <ChatThread
      peerName={peer?.full_name || "Utilisateur Objely"}
      peerAvatarUrl={peer?.avatar_url ?? null}
      currentUserId={currentUserId}
      messages={chatMessages}
      onSend={handleSend}
      onSendVoice={handleSendVoice}
      onSendImage={handleSendImage}
      onSendFile={handleSendFile}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onBack={() => router.back()}
    />
  );
}
