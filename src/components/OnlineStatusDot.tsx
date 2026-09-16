"use client";

import { useEffect, useState } from "react";

/** Green dot shown on the profile avatar only while the browser reports an active connection. */
export default function OnlineStatusDot({ className }: { className: string }) {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    setOnline(navigator.onLine);
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
