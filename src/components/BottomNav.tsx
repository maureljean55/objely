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
      {/* Refraction filter for the liquid-glass surface. Browsers that don't
          support an SVG reference inside backdrop-filter just fall back to
          the plain blur() also listed in the style below. */}
      <svg className="absolute w-0 h-0" aria-hidden="true">
        <filter id="liquid-glass-distortion" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.008 0.012" numOctaves="2" seed="7" result="noise" />
          <feGaussianBlur in="noise" stdDeviation="3" result="blurredNoise" />
          <feDisplacementMap in="SourceGraphic" in2="blurredNoise" scale="22" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>

      <div
        className="relative flex items-center justify-between gap-1 px-3 py-3 rounded-full overflow-hidden bg-surface-container-lowest/55 border border-white/50 dark:border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.7),inset_0_-1px_2px_rgba(0,31,63,0.08),0_20px_45px_rgba(0,31,63,0.2)]"
        style={{
          backdropFilter: "url(#liquid-glass-distortion) blur(16px) saturate(160%)",
          WebkitBackdropFilter: "blur(16px) saturate(160%)",
        }}
      >
        {/* Glossy specular highlight — glass material, tinted by the surface
            color above so icons stay legible whatever scrolls behind it. */}
        <div className="pointer-events-none absolute -top-8 right-6 w-32 h-24 rounded-full bg-white/50 dark:bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-10 left-4 w-20 h-16 rounded-full bg-white/20 dark:bg-white/5 blur-2xl" />
        <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-b from-white/25 dark:from-white/5 via-transparent to-white/5 dark:to-transparent" />

        {ITEMS.map((item) => {
          const isActive = item.key === active;
          return (
            <Link
              key={item.key}
              href={item.href}
              className={
                isActive
                  ? "relative z-10 flex flex-1 flex-col items-center justify-center gap-0.5 py-1 text-primary transition-transform"
                  : "relative z-10 flex flex-1 flex-col items-center justify-center gap-0.5 py-1 text-on-surface-variant transition-transform hover:text-primary"
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
