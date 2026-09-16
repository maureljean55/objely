"use client";

// Shared consent state for CookieBanner and any future non-essential
// script (analytics, ads, …). Strictly necessary cookies (Supabase auth
// session) are never gated by this — only optional trackers should be.

import { useEffect, useState } from "react";

export type CookieConsent = "accepted" | "rejected" | "dismissed";

export const COOKIE_CONSENT_STORAGE_KEY = "objely-cookie-consent";
const CONSENT_EVENT = "objely:cookie-consent";

export function getCookieConsent(): CookieConsent | null {
  try {
    return (localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY) as CookieConsent | null) ?? null;
  } catch {
    return null;
  }
}

export function setCookieConsent(value: CookieConsent) {
  try {
    localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, value);
  } catch {
    // Best-effort: the choice just won't persist across visits.
  }
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: value }));
}

/** Whether non-essential trackers (analytics, ads, …) may load. Only an explicit "accepted" counts. */
export function hasAnalyticsConsent(): boolean {
  return getCookieConsent() === "accepted";
}

/** Live consent value — updates immediately when the user answers the banner, in this tab or another. */
export function useCookieConsent(): CookieConsent | null {
  const [consent, setConsent] = useState<CookieConsent | null>(null);

  useEffect(() => {
    setConsent(getCookieConsent());

    const onConsentEvent = (event: Event) => setConsent((event as CustomEvent<CookieConsent>).detail);
    const onStorage = (event: StorageEvent) => {
      if (event.key === COOKIE_CONSENT_STORAGE_KEY) setConsent(getCookieConsent());
    };

    window.addEventListener(CONSENT_EVENT, onConsentEvent);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(CONSENT_EVENT, onConsentEvent);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return consent;
}
