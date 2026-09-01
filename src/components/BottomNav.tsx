import Link from "next/link";

type NavKey = "home" | "search" | "declare" | "messages" | "profile";

const ITEMS: { key: NavKey; href: string; icon: string; label: string }[] = [
  { key: "home", href: "/", icon: "home", label: "Home" },
  { key: "search", href: "/search", icon: "search", label: "Search" },
  { key: "declare", href: "/report-lost", icon: "add_circle", label: "Declare" },
  { key: "messages", href: "/chat", icon: "chat_bubble", label: "Messages" },
  { key: "profile", href: "/profile", icon: "person", label: "Profile" },
];

export default function BottomNav({ active }: { active: NavKey }) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-8 pt-2 bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0px_-10px_30px_rgba(0,31,63,0.08)] rounded-t-xl">
      {ITEMS.map((item) => {
        const isActive = item.key === active;

        if (item.key === "declare") {
          return (
            <Link
              key={item.key}
              href={item.href}
              className="flex flex-col items-center justify-center text-on-surface-variant px-3 py-1 hover:bg-surface-container-high/50 transition-colors rounded-xl group relative"
            >
              <div className="absolute -top-4 bg-primary text-on-primary rounded-full p-2 shadow-lg group-hover:scale-105 transition-transform">
                <span
                  className="material-symbols-outlined"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  add_circle
                </span>
              </div>
              <span className="font-label-md text-label-md mt-6">{item.label}</span>
            </Link>
          );
        }

        return (
          <Link
            key={item.key}
            href={item.href}
            className={
              isActive
                ? "flex flex-col items-center justify-center text-primary bg-primary-container/10 rounded-xl px-3 py-1 scale-90 transition-transform duration-150"
                : "flex flex-col items-center justify-center text-on-surface-variant px-3 py-1 hover:bg-surface-container-high/50 transition-colors rounded-xl relative"
            }
          >
            {item.key === "messages" && !isActive && (
              <span className="absolute top-1 right-2 w-2 h-2 bg-error rounded-full" />
            )}
            <span
              className="material-symbols-outlined mb-1"
              style={{ fontVariationSettings: `'FILL' ${isActive ? 1 : 0}` }}
            >
              {item.icon}
            </span>
            <span className="font-label-md text-label-md">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
