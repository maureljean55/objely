import { createClient } from "@/lib/supabase/client";

// pushManager.subscribe wants the VAPID public key as a raw Uint8Array, not
// the base64url string it's generated/stored as.
function urlBase64ToUint8Array(base64Url: string) {
  const padding = "=".repeat((4 - (base64Url.length % 4)) % 4);
  const base64 = (base64Url + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  return Uint8Array.from([...raw].map((char) => char.charCodeAt(0)));
}

/**
 * Registers this device for Web Push and stores the subscription so a call
 * can wake the app later (see CallProvider). Silently does nothing when
 * push isn't supported, permission was denied, or the VAPID key is
 * missing — calling still works over Realtime whenever the app is open.
 */
export async function subscribeToPush(userId: string) {
  const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!vapidKey || typeof window === "undefined") return;
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

  try {
    if (Notification.permission === "default") {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return;
    }
    if (Notification.permission !== "granted") return;

    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });
    }

    const json = subscription.toJSON();
    if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) return;

    const supabase = createClient();
    await supabase
      .from("push_subscriptions")
      .upsert(
        { user_id: userId, endpoint: json.endpoint, p256dh: json.keys.p256dh, auth: json.keys.auth },
        { onConflict: "endpoint" },
      );
  } catch {
    // Best-effort: a denied permission, an unsupported browser, or a flaky
    // network shouldn't block the rest of the app from working.
  }
}
