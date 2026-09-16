"use client";

import { useEffect, useState } from "react";

/** Green dot shown on the profile avatar only while the browser reports an active connection. */
export default function OnlineStatusDot({ className }: { className: string }) {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    // Not reading navigator.onLine here: it's notoriously unreliable (can
    // report false on load in some mobile browsers/webviews even with a
    // real connection) and, with nothing else to correct it, would leave
    // the dot stuck hidden. The explicit offline/online events are what
    // actually fire on real connectivity changes, so those drive state
    // instead — starting from the optimistic "online" default above.
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!online) return null;
  return <span className={className} />;
}
