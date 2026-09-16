import { createClient } from "@/lib/supabase/client";

export type NotificationType =
  | "match"
  | "message"
  | "verification_submitted"
  | "verification_confirmed"
  | "verification_rejected"
  | "restitution_proposed"
  | "restitution_responded"
  | "restitution_confirmed";

export type AppNotification = {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  match_id: string | null;
  direct_conversation_id: string | null;
  read: boolean;
  created_at: string;
};

/**
 * Notifies the other participant of a match event. Title/body are computed
 * server-side (notify_match_participant, security definer) from real match
 * data for every type except "message" — where messagePreview echoes what
 * was actually just sent, not arbitrary text. This is the only way to write
 * a match notification; there's no client-facing INSERT policy on
 * `notifications` for match rows anymore, so content can't be forged.
 */
export async function notifyMatchParticipant(
  matchId: string,
  type: NotificationType,
  options?: { messagePreview?: string; accepted?: boolean },
) {
  const supabase = createClient();
  return supabase.rpc("notify_match_participant", {
    p_match_id: matchId,
    p_type: type,
    p_message_preview: options?.messagePreview ?? null,
    p_accepted: options?.accepted ?? null,
  });
}

/** Notifies both sides of a newly-created match — same server-side content guarantee as notifyMatchParticipant. */
export async function notifyMatchCreated(matchId: string) {
  const supabase = createClient();
  return supabase.rpc("notify_match_created", { p_match_id: matchId });
}

export async function listMyNotifications() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user ?? null;
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
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user ?? null;
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
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user ?? null;
  if (!user) return;
  await supabase.from("notifications").update({ read: true }).eq("user_id", user.id).eq("read", false);
}
