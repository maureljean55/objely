import { createClient } from "@/lib/supabase/client";
import type { Item } from "@/lib/supabase/items";
import { createNotification } from "@/lib/supabase/notifications";

export type Message = {
  id: string;
  match_id: string;
  sender_id: string;
  body: string | null;
  kind: "text" | "voice";
  voice_url: string | null;
  edited_at: string | null;
  deleted_at: string | null;
  created_at: string;
};

export type MatchWithItems = {
  id: string;
  match_percent: number;
  status: "pending" | "confirmed" | "rejected";
  lost_item: Item;
  found_item: Item;
};

export async function getMatch(matchId: string) {
  const supabase = createClient();
  return supabase
    .from("matches")
    .select("id, match_percent, status, lost_item:items!matches_lost_item_id_fkey(*), found_item:items!matches_found_item_id_fkey(*)")
    .eq("id", matchId)
    .single<MatchWithItems>();
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

async function notifyOtherParticipant(matchId: string, senderId: string, notifBody: string) {
  const { data: match } = await getMatch(matchId);
  if (!match) return;
  const recipientId = match.lost_item.user_id === senderId ? match.found_item.user_id : match.lost_item.user_id;
  await createNotification(recipientId, "message", "Nouveau message", notifBody, matchId);
}

export async function sendMessage(matchId: string, body: string) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user ?? null;
  if (!user) return { data: null, error: new Error("Vous devez être connecté.") };

  const result = await supabase
    .from("messages")
    .insert({ match_id: matchId, sender_id: user.id, body, kind: "text" })
    .select()
    .single<Message>();

  if (!result.error) await notifyOtherParticipant(matchId, user.id, body.slice(0, 120));

  return result;
}

export async function sendVoiceMessage(matchId: string, voiceUrl: string) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user ?? null;
  if (!user) return { data: null, error: new Error("Vous devez être connecté.") };

  const result = await supabase
    .from("messages")
    .insert({ match_id: matchId, sender_id: user.id, kind: "voice", voice_url: voiceUrl })
    .select()
    .single<Message>();

  if (!result.error) await notifyOtherParticipant(matchId, user.id, "Note vocale");

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
