import { createClient } from "@/lib/supabase/client";

export type DirectMessage = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string | null;
  kind: "text" | "voice";
  voice_url: string | null;
  edited_at: string | null;
  deleted_at: string | null;
  created_at: string;
};

export type ConversationPeer = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
};

export type DirectConversationSummary = {
  conversation_id: string;
  other_user_id: string;
  other_full_name: string | null;
  other_avatar_url: string | null;
  last_message_body: string | null;
  last_message_kind: "text" | "voice" | null;
  last_message_deleted_at: string | null;
  last_message_sender_id: string | null;
  last_message_created_at: string | null;
};

/** Finds the existing conversation with this user, or creates one — safe to call repeatedly. */
export async function getOrCreateDirectConversation(otherUserId: string) {
  const supabase = createClient();
  return supabase.rpc("get_or_create_direct_conversation", { other_user_id: otherUserId }).single<string>();
}

export async function getDirectConversationPeer(conversationId: string) {
  const supabase = createClient();
  return supabase.rpc("get_direct_conversation_peer", { p_conversation_id: conversationId }).maybeSingle<ConversationPeer>();
}

export async function listDirectMessages(conversationId: string) {
  const supabase = createClient();
  return supabase
    .from("direct_messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .returns<DirectMessage[]>();
}

export async function sendDirectMessage(conversationId: string, body: string) {
  const supabase = createClient();
  return supabase.rpc("send_direct_message", { p_conversation_id: conversationId, p_body: body }).single<DirectMessage>();
}

export async function sendVoiceDirectMessage(conversationId: string, voiceUrl: string) {
  const supabase = createClient();
  return supabase
    .rpc("send_direct_message", { p_conversation_id: conversationId, p_voice_url: voiceUrl })
    .single<DirectMessage>();
}

export async function editDirectMessage(messageId: string, body: string) {
  const supabase = createClient();
  return supabase.rpc("edit_direct_message", { p_message_id: messageId, p_body: body }).single<DirectMessage>();
}

export async function deleteDirectMessage(messageId: string) {
  const supabase = createClient();
  return supabase.rpc("delete_direct_message", { p_message_id: messageId }).single<DirectMessage>();
}

export async function listMyDirectConversations() {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("list_my_direct_conversations");
  return { data: (data ?? []) as DirectConversationSummary[], error };
}
