"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  deleteDirectMessage,
  editDirectMessage,
  getDirectConversationPeer,
  listDirectMessages,
  sendDirectMessage,
  sendVoiceDirectMessage,
  type ConversationPeer,
  type DirectMessage,
} from "@/lib/supabase/directMessages";
import { uploadVoiceNote } from "@/lib/supabase/voiceNotes";
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
      peerName={peer?.full_name || "Utilisateur Objely"}
      peerAvatarUrl={peer?.avatar_url ?? null}
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
