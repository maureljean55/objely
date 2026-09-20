import { NextResponse } from "next/server";
import webpush from "web-push";
import { createClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/admin/supabaseAdmin";

/**
 * Best-effort wake-up for an incoming call: the caller's browser hits this
 * right after broadcasting the "ring" over Realtime (see CallProvider),
 * which only reaches the callee if their app is already open and
 * connected. This instead reaches every device they've granted
 * notification permission on (src/lib/push/subscribe.ts), even closed or
 * locked — the click handler in public/sw.js reopens the app at
 * `/?call=<callId>`, where CallProvider resumes the handshake by asking the
 * still-waiting caller to resend its offer.
 */
export async function POST(request: Request) {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;
  if (!publicKey || !privateKey || !subject) {
    // Not configured — calling still works over Realtime whenever the
    // callee's app is already open, so this isn't fatal.
    return NextResponse.json({ sent: 0 });
  }

  const body = await request.json().catch(() => null);
  const targetUserId = body?.targetUserId;
  const callId = body?.callId;
  const callerName = body?.callerName;
  if (typeof targetUserId !== "string" || typeof callId !== "string" || typeof callerName !== "string") {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }
  const callerAvatarUrl = typeof body?.callerAvatarUrl === "string" ? body.callerAvatarUrl : null;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.id === targetUserId) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const admin = createAdminSupabaseClient();
  if (!admin) return NextResponse.json({ sent: 0 });

  const { data: subscriptions } = await admin
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .eq("user_id", targetUserId);
  if (!subscriptions || subscriptions.length === 0) return NextResponse.json({ sent: 0 });

  webpush.setVapidDetails(subject, publicKey, privateKey);

  const payload = JSON.stringify({ type: "call", callId, callerName, callerAvatarUrl });
  const staleIds: string[] = [];

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload,
        );
      } catch (err: unknown) {
        const statusCode = (err as { statusCode?: number })?.statusCode;
        if (statusCode === 404 || statusCode === 410) staleIds.push(sub.id);
      }
    }),
  );

  if (staleIds.length > 0) await admin.from("push_subscriptions").delete().in("id", staleIds);

  return NextResponse.json({ sent: subscriptions.length - staleIds.length });
}
