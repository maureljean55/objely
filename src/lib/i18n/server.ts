import { cookies } from "next/headers";
import { translations, type Language, type TranslationDict } from "@/lib/i18n/translations";

const COOKIE_NAME = "objely-language";

/** Reads the language cookie for use in server components (home, activity, search...). */
export async function getServerLanguage(): Promise<Language> {
  const store = await cookies();
  const value = store.get(COOKIE_NAME)?.value;
  return value === "en" ? "en" : "fr";
}

export async function getServerTranslations(): Promise<TranslationDict> {
  return translations[await getServerLanguage()];
}
