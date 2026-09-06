import { createClient } from "@/lib/supabase/client";
import type { Item } from "@/lib/supabase/items";

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

export async function sendMessage(matchId: string, body: string) {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return { data: null, error: new Error("Vous devez être connecté.") };

  return supabase
    .from("messages")
    .insert({ match_id: matchId, sender_id: user.id, body })
    .select()
    .single<Message>();
}
