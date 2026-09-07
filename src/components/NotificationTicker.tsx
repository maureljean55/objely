"use client";

import { useEffect, useRef, useState } from "react";

const PREVENTION_MESSAGES = [
  { icon: "🛡️", text: "Donnez rendez-vous dans un lieu public" },
  { icon: "⚠️", text: "Méfiez-vous des lieux réputés à risque" },
  { icon: "🚫", text: "Ne partagez jamais vos coordonnées bancaires" },
  { icon: "🔍", text: "Vérifiez les détails avant de restituer" },
  { icon: "👥", text: "Privilégiez un échange accompagné, en journée" },
  { icon: "🚨", text: "Signalez tout comportement suspect" },
];

const HOLD_MS = 1200; // pause at the start and end of a scroll
const STATIC_MS = 5000; // how long a short (non-overflowing) message stays
const SCROLL_PX_PER_SEC = 50;

export default function NotificationTicker() {
  const [index, setIndex] = useState(0);
  const [offset, setOffset] = useState(0);
  const [duration, setDuration] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const text = textRef.current;
    if (!container || !text) return;

    // Reset instantly (no transition) before measuring the new message.
    setDuration(0);
    setOffset(0);

    const overflow = Math.max(0, text.scrollWidth - container.clientWidth);
    const timers: ReturnType<typeof setTimeout>[] = [];
    const next = () => setIndex((i) => (i + 1) % PREVENTION_MESSAGES.length);

    if (overflow === 0) {
      timers.push(setTimeout(next, STATIC_MS));
    } else {
      const scrollMs = (overflow / SCROLL_PX_PER_SEC) * 1000;
      // Hold at the start so the reader can begin, then scroll left until
      // the last word is visible, then hold again before switching.
      timers.push(
        setTimeout(() => {
          setDuration(scrollMs / 1000);
          setOffset(overflow);
        }, HOLD_MS),
      );
      timers.push(setTimeout(next, HOLD_MS + scrollMs + HOLD_MS));
    }

    return () => timers.forEach(clearTimeout);
  }, [index]);

  const current = PREVENTION_MESSAGES[index];

  return (
    <div ref={containerRef} className="bg-surface-container-lowest rounded-full shadow-sm px-4 py-2.5 overflow-hidden">
      <span
        key={index}
        ref={textRef}
        className="inline-block font-label-md text-label-md text-on-surface-variant whitespace-nowrap"
        style={{
          transform: `translateX(-${offset}px)`,
          transition: duration > 0 ? `transform ${duration}s linear` : "none",
        }}
      >
        {current.icon} {current.text}
      </span>
    </div>
  );
}
