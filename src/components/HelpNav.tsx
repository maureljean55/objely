import Link from "next/link";

type HelpNavKey = "messages" | "history" | "settings";

const ITEMS: { key: HelpNavKey; href: string; icon: string; label: string }[] = [
  { key: "messages", href: "/help", icon: "chat_bubble", label: "Messages" },
  { key: "history", href: "/help/history", icon: "history", label: "Historique" },
  { key: "settings", href: "/profile", icon: "settings", label: "Réglages" },
];

export default function HelpNav({ active }: { active: HelpNavKey }) {
  return (
    <>
      {/* Mobile bottom bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-surface/90 backdrop-blur-xl border-t border-outline-variant/30 flex justify-around items-center h-20 px-4 pb-6">
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

      {/* Desktop sidebar */}
      <nav className="hidden md:flex fixed left-0 top-14 h-[calc(100vh-3.5rem)] w-64 flex-col border-r border-outline-variant/30 bg-surface-container-lowest z-40 p-4">
        <ul className="space-y-2">
          {ITEMS.map((item) => {
            const isActive = item.key === active;
            return (
              <li key={item.key}>
                <Link
                  href={item.href}
                  className={
                    isActive
                      ? "flex items-center gap-3 px-4 py-3 rounded-xl bg-primary-container/10 text-primary font-headline-sm text-headline-sm transition-colors"
                      : "flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface-variant hover:bg-surface-container-high/50 font-body-md text-body-md transition-colors"
                  }
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontVariationSettings: `'FILL' ${isActive ? 1 : 0}` }}
                  >
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
