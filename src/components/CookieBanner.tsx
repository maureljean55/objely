"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "objely-cookie-consent";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      // Storage unavailable (private mode, blocked) — skip rather than nag every load.
    }
  }, []);

  const choose = (value: "accepted" | "rejected") => {
    setVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // Best-effort: the choice just won't persist across visits.
    }
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-x-4 z-[60] md:inset-x-auto md:right-6 md:left-auto md:max-w-sm"
      style={{ bottom: "calc(96px + env(safe-area-inset-bottom))" }}
    >
      <div className="bg-surface-container-lowest rounded-[24px] soft-shadow inner-stroke p-lg flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-primary shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
            cookie
          </span>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Objely utilise des cookies nécessaires au fonctionnement du service. Consultez notre{" "}
            <Link href="/rgpd" className="text-primary font-medium underline underline-offset-2">
              politique de confidentialité
            </Link>{" "}
            pour en savoir plus.
          </p>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={() => choose("rejected")}
            className="font-label-md text-label-md text-on-surface-variant px-4 py-2 rounded-full hover:bg-surface-container-low transition-colors"
          >
            Refuser
          </button>
          <button
            type="button"
            onClick={() => choose("accepted")}
            className="font-label-md text-label-md text-white bg-primary px-4 py-2 rounded-full hover:opacity-90 transition-opacity"
          >
            Accepter
          </button>
        </div>
      </div>
    </div>
  );
}
