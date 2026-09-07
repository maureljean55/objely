"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import { listMyNotifications, markAllAsRead, markAsRead, type AppNotification } from "@/lib/supabase/notifications";

const ICONS: Record<AppNotification["type"], { icon: string; bg: string; color: string; filled?: boolean }> = {
  match: { icon: "search", bg: "bg-primary/10", color: "text-primary", filled: true },
  message: { icon: "chat_bubble", bg: "bg-surface-container-high", color: "text-on-surface" },
  verification_submitted: { icon: "lock_open", bg: "bg-secondary/10", color: "text-secondary", filled: true },
  verification_confirmed: { icon: "check_circle", bg: "bg-[#e8f5e9]", color: "text-[#2e7d32]", filled: true },
  verification_rejected: { icon: "cancel", bg: "bg-error-container", color: "text-error" },
};

type Section = "Aujourd'hui" | "Hier" | "Plus anciennes";
const SECTIONS: Section[] = ["Aujourd'hui", "Hier", "Plus anciennes"];

function sectionFor(dateStr: string): Section {
  const d = new Date(dateStr);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return "Aujourd'hui";
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "Hier";
  return "Plus anciennes";
}

function formatTime(dateStr: string, section: Section) {
  const d = new Date(dateStr);
  if (section === "Aujourd'hui") {
    const mins = Math.floor((Date.now() - d.getTime()) / 60000);
    if (mins < 1) return "à l'instant";
    if (mins < 60) return `il y a ${mins} min`;
    return `il y a ${Math.floor(mins / 60)} h`;
  }
  if (section === "Hier") return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
}

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    listMyNotifications().then(({ data }) => setNotifications(data ?? []));
  }, []);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const handleMarkAllRead = async () => {
    setNotifications((items) => items.map((item) => ({ ...item, read: true })));
    await markAllAsRead();
  };

  const handleOpen = async (item: AppNotification) => {
    if (!item.read) {
      setNotifications((items) => items.map((n) => (n.id === item.id ? { ...n, read: true } : n)));
      await markAsRead(item.id);
    }
    if (!item.match_id) return;
    if (item.type === "message") {
      router.push(`/chat/${item.match_id}`);
    } else if (item.type === "verification_submitted") {
      // The finder should land straight on the review screen to see the
      // owner's answers and confirm or reject the match.
      router.push(`/activity/verification?match=${item.match_id}`);
    } else {
      router.push("/activity");
    }
  };

  return (
    <div className="bg-background text-on-background font-body-md antialiased min-h-screen pb-28 md:pb-12">
      <header
        className="glass-header fixed top-0 inset-x-0 z-50 flex flex-col items-center px-container-margin pb-2 w-full shadow-[0_1px_0_rgba(0,0,0,0.05)]"
        style={{ paddingTop: "calc(0.5rem + env(safe-area-inset-top))" }}
      >
        <div className="flex items-center justify-between w-full h-11">
          <button type="button" onClick={() => router.back()} aria-label="Retour" className="text-primary hover:opacity-70 transition-opacity active:scale-95 p-2 -ml-2 rounded-full">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>arrow_back_ios</span>
          </button>
          <div className="flex flex-col items-center">
            <h1 className="font-headline-md text-headline-md text-on-surface">Notifications</h1>
            <span className="font-label-md text-[11px] text-outline">
              {unreadCount > 0 ? `${unreadCount} nouvelle${unreadCount > 1 ? "s" : ""} notification${unreadCount > 1 ? "s" : ""}` : "Tout est à jour"}
            </span>
          </div>
          <button
            type="button"
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
            className="font-body-lg text-body-lg text-primary hover:opacity-70 transition-opacity active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
          >
            Tout lire
          </button>
        </div>
      </header>

      <main className="pt-[calc(92px+env(safe-area-inset-top))] max-w-2xl mx-auto">
        {notifications.length === 0 && (
          <p className="font-body-md text-body-md text-on-surface-variant text-center mt-xl px-container-margin">
            Aucune notification pour le moment.
          </p>
        )}

        {SECTIONS.map((section) => {
          const items = notifications.filter((n) => sectionFor(n.created_at) === section);
          if (items.length === 0) return null;
          return (
            <div key={section} className="mb-lg">
              <h2 className="px-container-margin font-label-md text-[11px] text-outline uppercase tracking-wider mb-2">{section}</h2>
              <div className="bg-surface-container-lowest divide-y divide-surface-variant/60 border-y border-surface-variant/60">
                {items.map((item) => {
                  const icon = ICONS[item.type];
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleOpen(item)}
                      className={`relative w-full flex items-start gap-3 p-md text-left transition-colors ${item.read ? "" : "bg-[#EBF2FF] hover:brightness-[0.98]"}`}
                    >
                      {!item.read && <span className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary" />}
                      <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ml-3 ${icon.bg} ${icon.color}`}>
                        <span className="material-symbols-outlined text-[20px]" style={icon.filled ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                          {icon.icon}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline gap-2 mb-0.5">
                          <h3 className={`font-body-md text-body-md truncate ${item.read ? "text-on-surface" : "text-on-surface font-semibold"}`}>{item.title}</h3>
                          <span className={`font-label-md text-[11px] shrink-0 ${item.read ? "text-outline" : "text-primary"}`}>
                            {formatTime(item.created_at, section)}
                          </span>
                        </div>
                        <p className={`font-body-md text-body-md line-clamp-2 ${item.read ? "text-outline" : "text-on-surface-variant"}`}>{item.body}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </main>

      <BottomNav active="activity" />
    </div>
  );
}
