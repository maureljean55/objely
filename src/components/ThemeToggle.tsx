"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // The actual theme is only knowable client-side (a blocking script in
    // <head> applies it before paint to avoid a flash); reading it here
    // after mount — rather than during render — avoids an SSR/hydration
    // mismatch, since the server always renders the light/off state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsDark(document.documentElement.classList.contains("dark"));
    setMounted(true);
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("objely-theme", next ? "dark" : "light");
  }

  const on = mounted && isDark;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={toggle}
      className="w-full flex items-center justify-between p-lg text-left menu-item-hover transition-colors border-b border-surface-variant/50"
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-tertiary-fixed/30 flex items-center justify-center text-tertiary">
          <span className="material-symbols-outlined">{on ? "dark_mode" : "light_mode"}</span>
        </div>
        <span className="font-body-lg text-body-lg text-on-surface">Mode sombre</span>
      </div>
      <span
        className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${
          on ? "bg-primary" : "bg-surface-container-highest"
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
            on ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </span>
    </button>
  );
}
