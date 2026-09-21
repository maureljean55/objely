"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { signOut } from "@/lib/auth";

export default function SuspendedSignOutButton() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isSigningOut}
      className="w-full max-w-xs h-14 bg-surface-container-high text-on-surface font-headline-sm text-headline-sm rounded-[16px] flex items-center justify-center gap-2 hover:bg-surface-container-highest active:scale-[0.98] transition-all disabled:opacity-50"
    >
      {isSigningOut ? "Déconnexion…" : "Se déconnecter"}
    </button>
  );
}
