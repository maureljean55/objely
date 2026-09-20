import { NextResponse } from "next/server";
import webpush from "web-push";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/admin/supabaseAdmin";

/**
 * The caller's own browser also broadcasts "ring" directly over Realtime
 * (see CallProvider.startCall) — that's faster when it works, but it means
 * standing up a brand-new websocket subscription from scratch on
 * whatever network the caller's phone happens to have at that moment, with
 * no retry if the handshake is slow or drops. This re-sends the same
 * broadcast from the server, whose connection isn't at the mercy of a
 * mobile network, so a flaky client-side send isn't the only way the
 * callee's already-open app hears about the call. The callee's "ring"
 * handler is idempotent (ignores anything once it's no longer idle), so
 * receiving both is harmless.
 */
async function broadcastRing(targetUserId: string, payload: Record<string, unknown>) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return;

  const client = createSupabaseClient(url, key, { auth: { persistSession: false } });
  const channel = client.channel(`calls:user:${targetUserId}`);

  try {
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("timeout")), 4000);
      channel.subscribe((status) => {
        if (status === "SUBSCRIBED") {
          clearTimeout(timer);
          resolve();
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
          clearTimeout(timer);
          reject(new Error(status));
        }
      });
    });
    await channel.send({ type: "broadcast", event: "ring", payload });
  } catch {
    // Best-effort — the client-side broadcast and/or push notification are
    // the other two legs of this, so a failure here alone isn't fatal.
  } finally {
    await client.removeChannel(channel);
  }
}

/**
 * Best-effort wake-up for an incoming call: the caller's browser already
 * broadcasts "ring" over Realtime (see CallProvider), which only reaches
 * the callee if their app is already open and connected — this re-sends
 * that same broadcast server-side (more reliable than the caller's own
 * mobile connection) and also reaches every device the callee granted
 * notification permission on (src/lib/push/subscribe.ts), even closed or
 * locked — the click handler in public/sw.js reopens the app at
 * `/?call=<callId>`, where CallProvider resumes the handshake by asking the
 * still-waiting caller to resend its offer.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const targetUserId = body?.targetUserId;
  const callId = body?.callId;
  const callerName = body?.callerName;
  const sdp = body?.sdp;
  if (
    typeof targetUserId !== "string" ||
    typeof callId !== "string" ||
    typeof callerName !== "string" ||
    !sdp ||
    typeof sdp !== "object"
  ) {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }
  const callerAvatarUrl = typeof body?.callerAvatarUrl === "string" ? body.callerAvatarUrl : null;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.id === targetUserId) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  await broadcastRing(targetUserId, {
    callId,
    from: { id: user.id, name: callerName, avatarUrl: callerAvatarUrl },
    sdp,
  });

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;
  if (!publicKey || !privateKey || !subject) {
    // Not configured — calling still works over Realtime whenever the
    // callee's app is already open, so this isn't fatal.
    return NextResponse.json({ sent: 0 });
  }

  const admin = createAdminSupabaseClient();
  if (!admin) return NextResponse.json({ sent: 0 });

  const { data: subscriptions } = await admin
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .eq("user_id", targetUserId);
  if (!subscriptions || subscriptions.length === 0) return NextResponse.json({ sent: 0 });

  webpush.setVapidDetails(subject, publicKey, privateKey);

  const pushPayload = JSON.stringify({ type: "call", callId, callerName, callerAvatarUrl });
  const staleIds: string[] = [];

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          pushPayload,
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
