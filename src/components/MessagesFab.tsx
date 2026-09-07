"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const STORAGE_KEY = "objely-messages-fab-position";
const SIZE = 56;
const MARGIN = 12;
const DRAG_THRESHOLD = 6;

type Position = { x: number; y: number };

function clamp(pos: Position): Position {
  const maxX = window.innerWidth - SIZE - MARGIN;
  const maxY = window.innerHeight - SIZE - MARGIN;
  return {
    x: Math.min(Math.max(pos.x, MARGIN), Math.max(maxX, MARGIN)),
    y: Math.min(Math.max(pos.y, MARGIN), Math.max(maxY, MARGIN)),
  };
}

function defaultPosition(): Position {
  return clamp({ x: window.innerWidth - SIZE - MARGIN, y: window.innerHeight - SIZE - 150 });
}

export default function MessagesFab({ unreadCount }: { unreadCount: number }) {
  const router = useRouter();
  const [position, setPosition] = useState<Position | null>(null);
  const dragRef = useRef<{ startX: number; startY: number; originX: number; originY: number; dragging: boolean } | null>(null);

  useEffect(() => {
    let initial: Position | null = null;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) initial = clamp(JSON.parse(saved));
    } catch {}
    // localStorage/window are only available client-side, so the starting
    // position can't be computed as a lazy initial state during SSR.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPosition(initial ?? defaultPosition());

    const onResize = () => setPosition((p) => (p ? clamp(p) : p));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!position) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = { startX: e.clientX, startY: e.clientY, originX: position.x, originY: position.y, dragging: false };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    if (!drag.dragging && Math.hypot(dx, dy) > DRAG_THRESHOLD) drag.dragging = true;
    if (drag.dragging) setPosition(clamp({ x: drag.originX + dx, y: drag.originY + dy }));
  };

  const handlePointerUp = () => {
    const drag = dragRef.current;
    dragRef.current = null;
    if (!drag) return;
    if (drag.dragging) {
      setPosition((p) => {
        if (p) {
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
          } catch {}
        }
        return p;
      });
    } else {
      router.push("/messages");
    }
  };

  if (!position) return null;

  return (
    <div
      role="link"
      tabIndex={0}
      aria-label={unreadCount > 0 ? `Messages, ${unreadCount} non lu${unreadCount > 1 ? "s" : ""}` : "Messages"}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") router.push("/messages");
      }}
      style={{ left: position.x, top: position.y, touchAction: "none" }}
      className="fixed z-40 w-14 h-14 select-none cursor-grab active:cursor-grabbing"
    >
      <span className="absolute inset-0 rounded-full bg-primary/40 radar-ping pointer-events-none" />
      <div className="fab-bounce relative w-14 h-14 rounded-full bg-gradient-to-br from-[#7c6ff0] via-primary to-[#00c6ff] text-on-primary shadow-xl flex items-center justify-center">
        <span className="material-symbols-outlined text-[26px] drop-shadow-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
          chat_bubble
        </span>
      </div>
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-error text-on-error font-label-md text-[11px] font-bold flex items-center justify-center border-2 border-background pointer-events-none">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </div>
  );
}
