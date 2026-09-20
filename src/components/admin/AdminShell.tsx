"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

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
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-surface-container-lowest border-b border-outline-variant/30 px-6 py-4 flex items-center justify-between">
        <div>
          <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Objely Admin</p>
          <h1 className="font-headline-md text-headline-md text-on-surface">{title}</h1>
        </div>
        <div className="flex items-center gap-4">
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
