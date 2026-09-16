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

  // Blocks interaction with the rest of the page while the banner is up —
  // it's meant to force a decision, not sit as a passive toast.
  useEffect(() => {
    if (!visible) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [visible]);

  const choose = (value: "accepted" | "rejected") => {
    setVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // Best-effort: the choice just won't persist across visits.
    }
  };

  // Dismissing via the close button records no choice, so the banner
  // returns on the next visit instead of silently counting as consent.
  const dismiss = () => setVisible(false);

  if (!visible) return null;

  return (
    <>
      <div className="fixed inset-0 z-[55] bg-black/30 backdrop-blur-[2px]" />

      <div
        className="fixed inset-x-4 z-[60] md:inset-x-auto md:right-6 md:left-auto md:max-w-sm animate-slideDown"
        style={{ top: "calc(16px + env(safe-area-inset-top))" }}
      >
        <div
          className="relative overflow-hidden rounded-[24px] p-lg flex flex-col gap-4"
          style={{
            background: "linear-gradient(150deg, #ffffff 0%, #f4f1ff 60%, #eef1ff 100%)",
            boxShadow:
              "0 18px 38px -14px rgba(79, 70, 229, 0.3), 0 3px 10px rgba(40, 70, 130, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.7)",
          }}
        >
          <div
            className="pointer-events-none absolute rounded-full blur-2xl opacity-25"
            style={{ width: 160, height: 160, top: -60, right: -50, background: "linear-gradient(135deg, #5b8cff, #c084fc)" }}
          />

          <button
            type="button"
            onClick={dismiss}
            aria-label="Fermer"
            className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-black/[0.06] transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>

          <div className="relative flex items-start gap-3 pr-6">
            <span
              className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0"
              style={{
                background: "linear-gradient(150deg, #5b8cff 0%, #8b5cf6 60%, #c084fc 100%)",
                boxShadow: "0 10px 18px -6px rgba(101, 80, 232, 0.55)",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M21 12.4c-1.4.2-2.8-.5-3.5-1.8a3.3 3.3 0 0 1-4-2.4A3.3 3.3 0 0 1 9.8 4C10.5 2.8 11.7 2 13 2a9 9 0 1 1-9 9c0-.3 0-.7.05-1a3.2 3.2 0 0 0 3.9-2.4"
                  fill="none"
                  stroke="white"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="9" cy="13" r="1.15" fill="white" />
                <circle cx="13.2" cy="15.8" r="1" fill="white" />
                <circle cx="14.5" cy="11.2" r="0.85" fill="white" />
              </svg>
            </span>
            <p className="font-body-md text-body-md text-on-surface-variant pt-1">
              Objely utilise des cookies nécessaires au fonctionnement du service. Consultez notre{" "}
              <Link href="/rgpd" className="text-primary font-semibold underline underline-offset-2">
                politique de confidentialité
              </Link>{" "}
              pour en savoir plus.
            </p>
          </div>

          <div className="relative flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => choose("rejected")}
              className="font-label-md text-label-md text-on-surface-variant px-4 py-2.5 rounded-full hover:bg-black/[0.04] transition-colors"
            >
              Refuser
            </button>
            <button
              type="button"
              onClick={() => choose("accepted")}
              className="font-label-md text-label-md text-white px-5 py-2.5 rounded-full transition-transform active:scale-95"
              style={{
                background: "linear-gradient(90deg, #1d3fd6, #7c3aed)",
                boxShadow: "0 10px 22px -8px rgba(37, 52, 220, 0.55)",
              }}
            >
              Accepter
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
