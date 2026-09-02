"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";

type NotificationItem = {
  id: string;
  section: "Aujourd'hui" | "Hier" | "Plus anciennes";
  icon: string;
  iconBg: string;
  iconColor: string;
  filled?: boolean;
  title: string;
  description: string;
  time: string;
  read: boolean;
};

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "match",
    section: "Aujourd'hui",
    icon: "search",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    filled: true,
    title: "Une correspondance a été trouvée",
    description: "Nous avons trouvé un objet qui pourrait correspondre à votre déclaration.",
    time: "Il y a 5 min",
    read: false,
  },
  {
    id: "message",
    section: "Aujourd'hui",
    icon: "chat_bubble",
    iconBg: "bg-surface-container-high",
    iconColor: "text-on-surface",
    title: "Nouveau message",
    description: "Vous avez reçu un nouveau message concernant votre objet perdu.",
    time: "Il y a 18 min",
    read: false,
  },
  {
    id: "verification",
    section: "Aujourd'hui",
    icon: "lock",
    iconBg: "bg-surface-container-high",
    iconColor: "text-on-surface",
    title: "Vérification de propriété",
    description: "Une demande de vérification concernant votre objet vous attend.",
    time: "Il y a 32 min",
    read: false,
  },
  {
    id: "support-new",
    section: "Aujourd'hui",
    icon: "support_agent",
    iconBg: "bg-primary",
    iconColor: "text-on-primary",
    filled: true,
    title: "Support Objely",
    description: "Bonjour, nous avons répondu à votre demande.",
    time: "Il y a 1 h",
    read: false,
  },
  {
    id: "returned",
    section: "Aujourd'hui",
    icon: "check_circle",
    iconBg: "bg-[#e8f5e9]",
    iconColor: "text-[#2e7d32]",
    filled: true,
    title: "Objet restitué",
    description: "Votre objet a été marqué comme restitué.",
    time: "Il y a 2 h",
    read: false,
  },
  {
    id: "support-yesterday",
    section: "Hier",
    icon: "support_agent",
    iconBg: "bg-surface-container-high",
    iconColor: "text-on-surface-variant",
    title: "Support Objely",
    description: "Votre demande a bien été prise en compte. Un conseiller va vous répondre sous peu.",
    time: "18:42",
    read: true,
  },
  {
    id: "declaration-published",
    section: "Hier",
    icon: "description",
    iconBg: "bg-surface-container-high",
    iconColor: "text-on-surface-variant",
    title: "Déclaration publiée",
    description: "Votre déclaration d'objet perdu est maintenant active et visible.",
    time: "15:20",
    read: true,
  },
  {
    id: "match-dismissed",
    section: "Plus anciennes",
    icon: "search",
    iconBg: "bg-surface-container-high",
    iconColor: "text-on-surface-variant",
    title: "Correspondance potentielle",
    description: "Une correspondance a été écartée suite à votre retour.",
    time: "Lun.",
    read: true,
  },
  {
    id: "system-update",
    section: "Plus anciennes",
    icon: "update",
    iconBg: "bg-surface-container-high",
    iconColor: "text-on-surface-variant",
    title: "Mise à jour système",
    description: "Découvrez les nouvelles fonctionnalités de l'application Objely.",
    time: "04 Nov",
    read: true,
  },
];

const SECTIONS: NotificationItem["section"][] = ["Aujourd'hui", "Hier", "Plus anciennes"];

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const markAllRead = () => setNotifications((items) => items.map((item) => ({ ...item, read: true })));
  const markRead = (id: string) =>
    setNotifications((items) => items.map((item) => (item.id === id ? { ...item, read: true } : item)));

  return (
    <div className="bg-background text-on-background font-body-md antialiased min-h-screen pb-28 md:pb-12">
      <header className="glass-header fixed top-0 inset-x-0 z-50 flex flex-col items-center px-container-margin py-2 w-full shadow-[0_1px_0_rgba(0,0,0,0.05)]">
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
            onClick={markAllRead}
            disabled={unreadCount === 0}
            className="font-body-lg text-body-lg text-primary hover:opacity-70 transition-opacity active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
          >
            Tout lire
          </button>
        </div>
      </header>

      <main className="pt-[92px] max-w-2xl mx-auto">
        {SECTIONS.map((section) => {
          const items = notifications.filter((n) => n.section === section);
          if (items.length === 0) return null;
          return (
            <div key={section} className="mb-lg">
              <h2 className="px-container-margin font-label-md text-[11px] text-outline uppercase tracking-wider mb-2">{section}</h2>
              <div className="bg-surface-container-lowest divide-y divide-surface-variant/60 border-y border-surface-variant/60">
                {items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => markRead(item.id)}
                    className={`relative w-full flex items-start gap-3 p-md text-left transition-colors ${item.read ? "" : "bg-[#EBF2FF] hover:brightness-[0.98]"}`}
                  >
                    {!item.read && <span className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary" />}
                    <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ml-3 ${item.iconBg} ${item.iconColor}`}>
                      <span className="material-symbols-outlined text-[20px]" style={item.filled ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                        {item.icon}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline gap-2 mb-0.5">
                        <h3 className={`font-body-md text-body-md truncate ${item.read ? "text-on-surface" : "text-on-surface font-semibold"}`}>{item.title}</h3>
                        <span className={`font-label-md text-[11px] shrink-0 ${item.read ? "text-outline" : "text-primary"}`}>{item.time}</span>
                      </div>
                      <p className={`font-body-md text-body-md line-clamp-2 ${item.read ? "text-outline" : "text-on-surface-variant"}`}>{item.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </main>

      <BottomNav active="activity" />
    </div>
  );
}
