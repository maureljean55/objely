import { createClient } from "@/lib/supabase/client";

export type NotificationType = "match" | "message" | "verification_submitted" | "verification_confirmed" | "verification_rejected";

export type AppNotification = {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  match_id: string | null;
  read: boolean;
  created_at: string;
};

export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  body: string,
  matchId: string,
) {
  const supabase = createClient();
  return supabase.from("notifications").insert({ user_id: userId, type, title, body, match_id: matchId });
}

export async function notifyMatchParticipants(
  lostUserId: string,
  foundUserId: string,
  type: NotificationType,
  title: string,
  body: string,
  matchId: string,
) {
  const supabase = createClient();
  await supabase.from("notifications").insert([
    { user_id: lostUserId, type, title, body, match_id: matchId },
    { user_id: foundUserId, type, title, body, match_id: matchId },
  ]);
}

export async function listMyNotifications() {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return { data: [] as AppNotification[], error: null };

  return supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .returns<AppNotification[]>();
}

export async function getUnreadCount(): Promise<number> {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return 0;

  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("read", false);

  return count ?? 0;
}

export async function markAsRead(id: string) {
  const supabase = createClient();
  return supabase.from("notifications").update({ read: true }).eq("id", id);
}

export async function markAllAsRead() {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return;
  await supabase.from("notifications").update({ read: true }).eq("user_id", user.id).eq("read", false);
}
