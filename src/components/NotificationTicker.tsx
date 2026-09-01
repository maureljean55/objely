"use client";

import { useEffect, useState } from "react";

const NOTIFICATIONS = [
  { icon: "🔑", text: "Clés trouvées à Paris 11e", time: "il y a 5 min" },
  { icon: "👜", text: "Sac restitué à son propriétaire", time: "il y a 1 h" },
  { icon: "📱", text: "Nouvelle correspondance trouvée", time: "il y a 3 h" },
];

export default function NotificationTicker() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % NOTIFICATIONS.length);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  const current = NOTIFICATIONS[index];

  return (
    <div className="bg-surface-container-lowest rounded-full shadow-sm px-4 py-2.5 overflow-hidden">
      <div key={index} className="flex items-center gap-2 animate-fadeIn">
        <span className="font-label-md text-label-md text-on-surface-variant truncate">
          {current.icon} {current.text}
        </span>
        <span className="text-outline-variant shrink-0">•</span>
        <span className="font-label-md text-label-md text-outline shrink-0 whitespace-nowrap">{current.time}</span>
      </div>
    </div>
  );
}
