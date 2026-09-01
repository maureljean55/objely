import Link from "next/link";

type HelpNavKey = "messages" | "history" | "settings";

const ITEMS: { key: HelpNavKey; href: string; icon: string; label: string }[] = [
  { key: "messages", href: "/help", icon: "chat_bubble", label: "Messages" },
  { key: "history", href: "/help/history", icon: "history", label: "Historique" },
  { key: "settings", href: "/profile", icon: "settings", label: "Réglages" },
];

export default function HelpNav({ active }: { active: HelpNavKey }) {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-surface/90 backdrop-blur-xl border-t border-outline-variant/30 flex justify-around items-center h-20 px-4 pb-6">
      {ITEMS.map((item) => {
        const isActive = item.key === active;
        return (
          <Link
            key={item.key}
            href={item.href}
            className={
              isActive
                ? "flex flex-col items-center justify-center gap-1 text-primary font-semibold"
                : "flex flex-col items-center justify-center gap-1 text-outline hover:text-on-surface transition-colors"
            }
          >
            <span
              className="material-symbols-outlined text-2xl"
              style={{ fontVariationSettings: `'FILL' ${isActive ? 1 : 0}` }}
            >
              {item.icon}
            </span>
            <span className="font-label-md text-[11px] leading-none">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
