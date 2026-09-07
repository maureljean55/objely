"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { translations, type Language, type TranslationDict } from "@/lib/i18n/translations";

const STORAGE_KEY = "objely-language";
const COOKIE_NAME = "objely-language";

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: TranslationDict;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function writeCookie(language: Language) {
  // Readable by server components (home, activity, search...) via
  // next/headers cookies() — localStorage alone can't cross that boundary.
  document.cookie = `${COOKIE_NAME}=${language}; path=/; max-age=31536000; SameSite=Lax`;
}

export function LanguageProvider({ children, initialLanguage }: { children: ReactNode; initialLanguage: Language }) {
  const [language, setLanguageState] = useState<Language>(initialLanguage);

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(STORAGE_KEY);
    } catch {}
    if ((stored === "en" || stored === "fr") && stored !== initialLanguage) {
      // localStorage can disagree with the cookie (e.g. cookie cleared) —
      // reconcile once on mount, client-only so this can't run during SSR.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLanguageState(stored);
      writeCookie(stored);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setLanguage = (next: Language) => {
    setLanguageState(next);
    document.documentElement.lang = next;
    writeCookie(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {}
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
