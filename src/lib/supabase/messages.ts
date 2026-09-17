import { createClient } from "@/lib/supabase/client";
import type { Item } from "@/lib/supabase/items";
import { notifyMatchParticipant } from "@/lib/supabase/notifications";

export type Message = {
  id: string;
  match_id: string;
  sender_id: string;
  body: string | null;
  kind: "text" | "voice" | "restitution_proposal";
  voice_url: string | null;
  edited_at: string | null;
  deleted_at: string | null;
  created_at: string;
  reply_to_id: string | null;
  restitution_appointment_id: string | null;
};

export type MatchWithItems = {
  id: string;
  match_percent: number;
  status: "pending" | "confirmed" | "rejected";
  lost_item: Item;
  found_item: Item;
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
    .select("id, match_percent, status, lost_item_id, found_item_id")
    .eq("id", matchId)
    .single<{ id: string; match_percent: number; status: MatchWithItems["status"]; lost_item_id: string; found_item_id: string }>();
  if (error || !match) return { data: null, error };

  const [{ data: lostItem }, { data: foundItem }] = await Promise.all([
    supabase.from("items_public").select("*").eq("id", match.lost_item_id).single<Item>(),
    supabase.from("items_public").select("*").eq("id", match.found_item_id).single<Item>(),
  ]);
  if (!lostItem || !foundItem) return { data: null, error: new Error("Objet introuvable.") };

  return {
    data: { id: match.id, match_percent: match.match_percent, status: match.status, lost_item: lostItem, found_item: foundItem },
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

export type Conversation = { match: MatchWithItems; lastMessage: Message | null };

/** Every confirmed match the current user is part of, newest activity first. */
export async function listMyConversations() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user ?? null;
  if (!user) return { data: [] as Conversation[], error: null };

  const { data: matches, error } = await supabase
    .from("matches")
    .select("id, match_percent, status, lost_item:items!matches_lost_item_id_fkey(*), found_item:items!matches_found_item_id_fkey(*)")
    .eq("status", "confirmed")
    .returns<MatchWithItems[]>();

  if (error || !matches || matches.length === 0) return { data: [], error };

  const matchIds = matches.map((m) => m.id);
  const { data: recentMessages } = await supabase
    .from("messages")
    .select("*")
    .in("match_id", matchIds)
    .order("created_at", { ascending: false })
    .returns<Message[]>();

  const lastByMatch = new Map<string, Message>();
  for (const message of recentMessages ?? []) {
    if (!lastByMatch.has(message.match_id)) lastByMatch.set(message.match_id, message);
  }

  const conversations: Conversation[] = matches.map((match) => ({ match, lastMessage: lastByMatch.get(match.id) ?? null }));
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

export async function editMessage(messageId: string, body: string) {
  const supabase = createClient();
  return supabase.rpc("edit_message", { p_message_id: messageId, p_body: body }).single<Message>();
}

export async function deleteMessage(messageId: string) {
  const supabase = createClient();
  return supabase.rpc("delete_message", { p_message_id: messageId }).single<Message>();
}
