"use client";

import { useEffect, useState } from "react";

function greetingWord(hour: number) {
  return hour >= 18 || hour < 6 ? "Bonsoir" : "Bonjour";
}

function firstName(fullName: string | null) {
  if (!fullName) return null;
  return fullName.trim().split(/\s+/)[0] || null;
}

/**
 * "Bonjour"/"Bonsoir" (18h-6h) + the user's first name. Resolved in an
 * effect rather than during render — the server and the visitor's browser
 * can disagree on the current hour (different timezones/clocks), so
 * computing it during SSR risks a hydration mismatch.
 */
export default function Greeting({ fullName, className }: { fullName: string | null; className?: string }) {
  const [word, setWord] = useState<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWord(greetingWord(new Date().getHours()));
  }, []);

  if (!word) return null;

  const name = firstName(fullName);
  return (
    <span className={className}>
      {word}
      {name ? `, ${name}` : ""}
    </span>
  );
}
