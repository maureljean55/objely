"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    // Registering in dev lets the SW's cache-first strategy for /_next/static/
    // serve stale chunks over HMR-recompiled ones, making live edits appear
    // not to apply. Production only, where content-hashed filenames make
    // that caching safe.
    if (process.env.NODE_ENV !== "production") return;
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Installation is best-effort: the app still works fully online without it.
      });
    }
  }, []);

  return null;
}
