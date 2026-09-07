import type { TranslationDict } from "@/lib/i18n/translations";

/** Shared by every page that shows a relative timestamp (home, activity, messages, help history...). */
export function formatTimeAgo(dateStr: string, t: TranslationDict): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return t.common.timeNow;
  if (mins < 60) return t.common.timeMinAgo.replace("{n}", String(mins));
  const hours = Math.floor(mins / 60);
  if (hours < 24) return t.common.timeHoursAgo.replace("{n}", String(hours));
  const days = Math.floor(hours / 24);
  if (days === 1) return t.common.timeYesterday;
  if (days < 7) return t.common.timeDaysAgo.replace("{n}", String(days));
  return new Date(dateStr).toLocaleDateString(t.common.locale);
}
