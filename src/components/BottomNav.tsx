import Link from "next/link";

type NavKey = "home" | "search" | "activity" | "profile";

const SIDE_ITEMS: { key: NavKey; href: string; icon: string; label: string }[] = [
  { key: "home", href: "/", icon: "home", label: "Home" },
  { key: "search", href: "/search", icon: "search", label: "Search" },
];

const TRAILING_ITEMS: { key: NavKey; href: string; icon: string; label: string }[] = [
  { key: "activity", href: "/chat", icon: "explore", label: "Activity" },
  { key: "profile", href: "/profile", icon: "person", label: "Profile" },
];

function NavItem({
  item,
  isActive,
}: {
  item: { key: NavKey; href: string; icon: string; label: string };
  isActive: boolean;
}) {
  return (
    <Link
      href={item.href}
      className={
        isActive
          ? "flex flex-col items-center justify-center gap-0.5 text-primary transition-transform"
          : "flex flex-col items-center justify-center gap-0.5 text-on-surface-variant transition-transform hover:text-primary"
      }
    >
      <span
        className="material-symbols-outlined"
        style={{ fontVariationSettings: `'FILL' ${isActive ? 1 : 0}` }}
      >
        {item.icon}
      </span>
      <span className="font-label-md text-label-md">{item.label}</span>
    </Link>
  );
}

export default function BottomNav({ active }: { active: NavKey }) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-50">
      <div className="relative flex items-center justify-between px-8 pt-3 pb-8 bg-surface-container-lowest/95 backdrop-blur-xl shadow-nav rounded-t-[28px]">
        <div className="flex items-center gap-8">
          {SIDE_ITEMS.map((item) => (
            <NavItem key={item.key} item={item} isActive={item.key === active} />
          ))}
        </div>
        <div className="flex items-center gap-8">
          {TRAILING_ITEMS.map((item) => (
            <NavItem key={item.key} item={item} isActive={item.key === active} />
          ))}
        </div>
        <Link
          href="/report-lost"
          aria-label="Déclarer un objet"
          className="absolute left-1/2 -top-6 -translate-x-1/2 w-16 h-16 rounded-full bg-primary btn-primary-gradient text-on-primary flex items-center justify-center shadow-[0px_8px_20px_rgba(0,88,188,0.35)] hover:scale-105 active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined text-3xl">add</span>
        </Link>
      </div>
    </nav>
  );
}
