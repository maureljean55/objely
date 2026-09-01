import Link from "next/link";

type NavKey = "home" | "search" | "declare" | "activity" | "profile";

const ITEMS: { key: NavKey; href: string; icon: string; label: string }[] = [
  { key: "home", href: "/", icon: "home", label: "Home" },
  { key: "search", href: "/search", icon: "search", label: "Search" },
  { key: "declare", href: "/report-lost", icon: "add_circle", label: "Declare" },
  { key: "activity", href: "/chat", icon: "explore", label: "Activity" },
  { key: "profile", href: "/profile", icon: "person", label: "Profile" },
];

export default function BottomNav({ active }: { active: NavKey }) {
  return (
    <nav className="md:hidden fixed inset-x-4 bottom-4 z-50">
      <div className="relative flex items-center justify-between gap-1 px-3 py-3 rounded-full overflow-hidden bg-gradient-to-br from-[#0a1240]/80 via-[#0f1a5c]/75 to-primary/70 backdrop-blur-2xl border border-white/15 shadow-[0_20px_45px_rgba(0,20,60,0.45)]">
        {/* Glossy specular highlight */}
        <div className="pointer-events-none absolute -top-6 right-10 w-28 h-20 rounded-full bg-white/25 blur-2xl" />
        <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-b from-white/10 to-transparent" />

        {ITEMS.map((item) => {
          const isActive = item.key === active;
          return (
            <Link
              key={item.key}
              href={item.href}
              className={
                isActive
                  ? "relative z-10 flex flex-1 flex-col items-center justify-center gap-0.5 py-1 text-white transition-transform"
                  : "relative z-10 flex flex-1 flex-col items-center justify-center gap-0.5 py-1 text-white/60 transition-transform hover:text-white/90"
              }
            >
              <span
                className="material-symbols-outlined text-[22px]"
                style={{ fontVariationSettings: `'FILL' ${isActive ? 1 : 0}` }}
              >
                {item.icon}
              </span>
              <span className="font-label-md text-[11px] leading-none">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
