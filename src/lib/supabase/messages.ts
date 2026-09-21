import { createClient } from "@/lib/supabase/client";
import type { Item } from "@/lib/supabase/items";
import { notifyMatchParticipant } from "@/lib/supabase/notifications";

export type Message = {
  id: string;
  match_id: string;
  sender_id: string;
  body: string | null;
  kind: "text" | "voice" | "restitution_proposal" | "attachment";
  voice_url: string | null;
  edited_at: string | null;
  deleted_at: string | null;
  created_at: string;
  reply_to_id: string | null;
  restitution_appointment_id: string | null;
  attachment_url: string | null;
  attachment_name: string | null;
  attachment_type: string | null;
};

export type MatchWithItems = {
  id: string;
  match_percent: number;
  status: "pending" | "confirmed" | "rejected";
  chat_closed_at: string | null;
  lost_item: Item;
  found_item: Item;
};

export type MatchParticipantProfile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
};

/**
 * Fetched as two steps (not a single embedded query) because the item rows
 * need to come from items_public rather than items directly: a pending
 * match's found item may have hide_exact_location set, and PostgREST's
 * embedding syntax resolves through the actual foreign key, which targets
 * items, not a view — so it can't apply that redaction on its own.
 */
export async function getMatch(matchId: string) {
  const supabase = createClient();
  const { data: match, error } = await supabase
    .from("matches")
    .select("id, match_percent, status, chat_closed_at, lost_item_id, found_item_id")
    .eq("id", matchId)
    .single<{
      id: string;
      match_percent: number;
      status: MatchWithItems["status"];
      chat_closed_at: string | null;
      lost_item_id: string;
      found_item_id: string;
    }>();
  if (error || !match) return { data: null, error };

  const [{ data: lostItem }, { data: foundItem }] = await Promise.all([
    supabase.from("items_public").select("*").eq("id", match.lost_item_id).single<Item>(),
    supabase.from("items_public").select("*").eq("id", match.found_item_id).single<Item>(),
  ]);
  if (!lostItem || !foundItem) return { data: null, error: new Error("Objet introuvable.") };

  return {
    data: {
      id: match.id,
      match_percent: match.match_percent,
      status: match.status,
      chat_closed_at: match.chat_closed_at,
      lost_item: lostItem,
      found_item: foundItem,
    },
    error: null,
  };
}

export async function listMessages(matchId: string) {
  const supabase = createClient();
  return supabase
    .from("messages")
    .select("*")
    .eq("match_id", matchId)
    .order("created_at", { ascending: true })
    .returns<Message[]>();
}

export type Conversation = { match: MatchWithItems; lastMessage: Message | null; otherProfile: MatchParticipantProfile | null };

export async function getMatchParticipantProfile(matchId: string) {
  const supabase = createClient();
  return supabase.rpc("get_match_participant_profile", { p_match_id: matchId }).maybeSingle<MatchParticipantProfile>();
}

/** Every confirmed match the current user is part of, newest activity first. */
export async function listMyConversations() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user ?? null;
  if (!user) return { data: [] as Conversation[], error: null };

  const { data: matches, error } = await supabase
    .from("matches")
    .select(
      "id, match_percent, status, chat_closed_at, lost_item:items!matches_lost_item_id_fkey(*), found_item:items!matches_found_item_id_fkey(*)",
    )
    .eq("status", "confirmed")
    .returns<MatchWithItems[]>();

  if (error || !matches || matches.length === 0) return { data: [], error };

  const matchIds = matches.map((m) => m.id);
  const [{ data: recentMessages }, profileResults] = await Promise.all([
    supabase
      .from("messages")
      .select("*")
      .in("match_id", matchIds)
      .order("created_at", { ascending: false })
      .returns<Message[]>(),
    Promise.all(matchIds.map((id) => getMatchParticipantProfile(id))),
  ]);

  const lastByMatch = new Map<string, Message>();
  for (const message of recentMessages ?? []) {
    if (!lastByMatch.has(message.match_id)) lastByMatch.set(message.match_id, message);
  }

  const profileByMatch = new Map<string, MatchParticipantProfile | null>();
  matchIds.forEach((id, index) => profileByMatch.set(id, profileResults[index].data ?? null));

  const conversations: Conversation[] = matches.map((match) => ({
    match,
    lastMessage: lastByMatch.get(match.id) ?? null,
    otherProfile: profileByMatch.get(match.id) ?? null,
  }));
  conversations.sort((a, b) => {
    if (a.lastMessage && b.lastMessage) return b.lastMessage.created_at.localeCompare(a.lastMessage.created_at);
    if (a.lastMessage) return -1;
    if (b.lastMessage) return 1;
    return 0;
  });

  return { data: conversations, error: null };
}

export async function sendMessage(matchId: string, body: string, replyToId: string | null = null) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user ?? null;
  if (!user) return { data: null, error: new Error("Vous devez être connecté.") };

  const result = await supabase
    .from("messages")
    .insert({ match_id: matchId, sender_id: user.id, body, kind: "text", reply_to_id: replyToId })
    .select()
    .single<Message>();

  if (!result.error) await notifyMatchParticipant(matchId, "message", { messagePreview: body });

  return result;
}

export async function sendVoiceMessage(matchId: string, voiceUrl: string, replyToId: string | null = null) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user ?? null;
  if (!user) return { data: null, error: new Error("Vous devez être connecté.") };

  const result = await supabase
    .from("messages")
    .insert({ match_id: matchId, sender_id: user.id, kind: "voice", voice_url: voiceUrl, reply_to_id: replyToId })
    .select()
    .single<Message>();

  if (!result.error) await notifyMatchParticipant(matchId, "message", { messagePreview: "Note vocale" });

  return result;
}

export async function sendAttachmentMessage(
  matchId: string,
  attachment: { url: string; name: string; type: string },
  replyToId: string | null = null,
) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user ?? null;
  if (!user) return { data: null, error: new Error("Vous devez être connecté.") };

  const result = await supabase
    .from("messages")
    .insert({
      match_id: matchId,
      sender_id: user.id,
      kind: "attachment",
      attachment_url: attachment.url,
      attachment_name: attachment.name,
      attachment_type: attachment.type,
      reply_to_id: replyToId,
    })
    .select()
    .single<Message>();

  if (!result.error) await notifyMatchParticipant(matchId, "message", { messagePreview: attachment.name });

  return result;
}

/**
 * Either participant can end a confirmed match's conversation at any time.
 * Doesn't touch the match's own status or delete history — it only blocks
 * new messages (enforced server-side, not just hidden in the UI) and marks
 * chat_closed_at so the Activity page can grey out "Discuter" for both
 * sides.
 */
export async function closeChat(matchId: string) {
  const supabase = createClient();
  const result = await supabase.rpc("close_chat", { p_match_id: matchId }).single<{ chat_closed_at: string | null }>();
  if (!result.error) await notifyMatchParticipant(matchId, "chat_closed");
  return result;
}

export async function editMessage(messageId: string, body: string) {
  const supabase = createClient();
  return supabase.rpc("edit_message", { p_message_id: messageId, p_body: body }).single<Message>();
}

export async function deleteMessage(messageId: string) {
  const supabase = createClient();
  return supabase.rpc("delete_message", { p_message_id: messageId }).single<Message>();
}
