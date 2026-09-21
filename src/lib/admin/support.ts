import { createAdminSupabaseClient } from "@/lib/admin/supabaseAdmin";

export type AdminSupportMessage = {
  id: string;
  sender: "user" | "bot" | "admin";
  sender_name: string | null;
  kind: "text" | "attachment";
  body: string | null;
  attachment_url: string | null;
  attachment_name: string | null;
  attachment_type: string | null;
  created_at: string;
};

export type AdminSupportConversation = {
  id: string;
  status: "bot" | "escalated" | "closed";
  created_at: string;
  updated_at: string;
  user: { full_name: string | null; public_id: string } | null;
  last_message_body: string | null;
  last_message_at: string | null;
};

export async function listSupportConversations(): Promise<AdminSupportConversation[]> {
  const admin = createAdminSupabaseClient();
  if (!admin) return [];

  const { data: conversations, error } = await admin
    .from("support_conversations")
    .select("id, status, created_at, updated_at, user_id")
    .order("updated_at", { ascending: false });

  if (error || !conversations) {
    console.error("Failed to load support_conversations", error);
    return [];
  }

  const userIds = [...new Set(conversations.map((c) => c.user_id))];
  const { data: profiles } = userIds.length
    ? await admin.from("profiles").select("id, full_name, public_id").in("id", userIds)
    : { data: [] as { id: string; full_name: string | null; public_id: string }[] };
  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));

  const conversationIds = conversations.map((c) => c.id);
  const { data: messages } = conversationIds.length
    ? await admin
        .from("support_messages")
        .select("conversation_id, body, kind, created_at")
        .in("conversation_id", conversationIds)
        .order("created_at", { ascending: false })
    : { data: [] as { conversation_id: string; body: string | null; kind: string; created_at: string }[] };

  const lastMessageByConversation = new Map<string, { body: string | null; kind: string; created_at: string }>();
  for (const m of messages ?? []) {
    if (!lastMessageByConversation.has(m.conversation_id)) lastMessageByConversation.set(m.conversation_id, m);
  }

  return conversations.map((c) => {
    const profile = profileById.get(c.user_id) ?? null;
    const lastMessage = lastMessageByConversation.get(c.id);
    return {
      id: c.id,
      status: c.status,
      created_at: c.created_at,
      updated_at: c.updated_at,
      user: profile ? { full_name: profile.full_name, public_id: profile.public_id } : null,
      last_message_body: lastMessage ? (lastMessage.kind === "attachment" ? "Pièce jointe" : lastMessage.body) : null,
      last_message_at: lastMessage?.created_at ?? null,
    };
  });
}

export async function getSupportConversation(id: string): Promise<{
  conversation: AdminSupportConversation | null;
  messages: AdminSupportMessage[];
}> {
  const admin = createAdminSupabaseClient();
  if (!admin) return { conversation: null, messages: [] };

  const { data: conversation } = await admin
    .from("support_conversations")
    .select("id, status, created_at, updated_at, user_id")
    .eq("id", id)
    .maybeSingle();
  if (!conversation) return { conversation: null, messages: [] };

  const { data: profile } = await admin
    .from("profiles")
    .select("full_name, public_id")
    .eq("id", conversation.user_id)
    .maybeSingle();

  const { data: messages } = await admin
    .from("support_messages")
    .select("id, sender, sender_name, kind, body, attachment_url, attachment_name, attachment_type, created_at")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true });

  return {
    conversation: {
      id: conversation.id,
      status: conversation.status,
      created_at: conversation.created_at,
      updated_at: conversation.updated_at,
      user: profile ? { full_name: profile.full_name, public_id: profile.public_id } : null,
      last_message_body: null,
      last_message_at: null,
    },
    messages: (messages ?? []) as AdminSupportMessage[],
  };
}
