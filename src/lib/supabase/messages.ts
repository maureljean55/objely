import { createClient } from "@/lib/supabase/client";
import type { Item } from "@/lib/supabase/items";
import { createNotification } from "@/lib/supabase/notifications";

export type Message = {
  id: string;
  match_id: string;
  sender_id: string;
  body: string;
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
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
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

export async function sendMessage(matchId: string, body: string) {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return { data: null, error: new Error("Vous devez être connecté.") };

  const result = await supabase
    .from("messages")
    .insert({ match_id: matchId, sender_id: user.id, body })
    .select()
    .single<Message>();

  if (!result.error) {
    const { data: match } = await getMatch(matchId);
    if (match) {
      const recipientId = match.lost_item.user_id === user.id ? match.found_item.user_id : match.lost_item.user_id;
      await createNotification(recipientId, "message", "Nouveau message", body.slice(0, 120), matchId);
    }
  }

  return result;
}
