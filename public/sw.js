const CACHE_VERSION = "objely-cache-v2";
const APP_SHELL = ["/", "/offline", "/manifest.webmanifest", "/icons/icon-192.png", "/icons/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Page navigations: network-first so content stays fresh, falling back to
  // the cached copy (or the offline screen) when there is no connection.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match("/offline")))
    );
    return;
  }

  // Hashed build assets and app icons never change content under the same
  // URL, so serve from cache first and refresh it in the background.
  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/") || request.destination === "image") {
    event.respondWith(
      caches.match(request).then((cached) => {
        const network = fetch(request)
          .then((response) => {
            const copy = response.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
            return response;
          })
          .catch(() => cached);
        return cached || network;
      })
    );
  }
});

// Wakes the app for an incoming call even when it's closed or the phone is
// locked — sent by src/app/api/calls/ring/route.ts right after the caller
// broadcasts over Realtime, which only reaches an already-open, connected
// tab on its own.
self.addEventListener("push", (event) => {
  if (!event.data) return;
  let data;
  try {
    data = event.data.json();
  } catch {
    return;
  }
  if (data.type !== "call") return;

  event.waitUntil(
    self.registration.showNotification(`Appel de ${data.callerName}`, {
      body: "Appuyez pour répondre",
      icon: "/icons/icon-192.png",
      tag: `call-${data.callId}`,
      requireInteraction: true,
      vibrate: [300, 150, 300, 150, 300],
      data: { url: `/?call=${encodeURIComponent(data.callId)}` },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data && event.notification.data.url ? event.notification.data.url : "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) {
          if ("navigate" in client) client.navigate(url);
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    })
  );
});
