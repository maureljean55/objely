import { createClient } from "@/lib/supabase/client";

export type SupportConversation = {
  id: string;
  status: "bot" | "escalated" | "closed";
  created_at: string;
  updated_at: string;
};

export type SupportMessage = {
  id: string;
  conversation_id: string;
  sender: "user" | "bot" | "admin";
  body: string;
  created_at: string;
};

export type SupportConversationSummary = { conversation: SupportConversation; lastMessage: SupportMessage | null };

/** Every support conversation the current user has ever had, newest activity first. */
export async function listMySupportConversations() {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return { data: [] as SupportConversationSummary[], error: null };

  const { data: conversations, error } = await supabase
    .from("support_conversations")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .returns<SupportConversation[]>();

  if (error || !conversations || conversations.length === 0) return { data: [], error };

  const ids = conversations.map((c) => c.id);
  const { data: recentMessages } = await supabase
    .from("support_messages")
    .select("*")
    .in("conversation_id", ids)
    .order("created_at", { ascending: false })
    .returns<SupportMessage[]>();

  const lastByConversation = new Map<string, SupportMessage>();
  for (const message of recentMessages ?? []) {
    if (!lastByConversation.has(message.conversation_id)) lastByConversation.set(message.conversation_id, message);
  }

  const summaries: SupportConversationSummary[] = conversations.map((conversation) => ({
    conversation,
    lastMessage: lastByConversation.get(conversation.id) ?? null,
  }));
  summaries.sort((a, b) => {
    const aTime = a.lastMessage?.created_at ?? a.conversation.created_at;
    const bTime = b.lastMessage?.created_at ?? b.conversation.created_at;
    return bTime.localeCompare(aTime);
  });

  return { data: summaries, error: null };
}
