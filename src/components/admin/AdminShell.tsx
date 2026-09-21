"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/admin/signalements", label: "Signalements" },
  { href: "/admin/support", label: "Support" },
];

export default function AdminShell({
  title,
  adminName,
  children,
}: {
  title: string;
  adminName: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-surface-container-lowest border-b border-outline-variant/30 px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <div>
            <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Objely Admin</p>
            <h1 className="font-headline-md text-headline-md text-on-surface">{title}</h1>
          </div>
          <nav className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const active = pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-full font-label-md text-label-md transition-colors ${
                    active ? "bg-primary text-on-primary" : "text-on-surface-variant hover:bg-surface-container"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <span className="font-body-md text-body-md text-on-surface-variant">{adminName}</span>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="font-label-md text-label-md text-error hover:opacity-70 transition-opacity disabled:opacity-50"
          >
            Se déconnecter
          </button>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
