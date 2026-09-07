"use client";

import { useEffect, useState } from "react";

const PREVENTION_MESSAGES = [
  { icon: "🛡️", text: "Donnez rendez-vous dans un lieu public" },
  { icon: "⚠️", text: "Méfiez-vous des lieux réputés à risque" },
  { icon: "🚫", text: "Ne partagez jamais vos coordonnées bancaires" },
  { icon: "🔍", text: "Vérifiez les détails avant de restituer" },
  { icon: "👥", text: "Privilégiez un échange accompagné, en journée" },
  { icon: "🚨", text: "Signalez tout comportement suspect" },
];

export default function NotificationTicker() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % PREVENTION_MESSAGES.length);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  const current = PREVENTION_MESSAGES[index];

  return (
    <div className="bg-surface-container-lowest rounded-2xl shadow-sm px-4 py-2.5">
      <div key={index} className="flex items-center gap-2 animate-fadeIn">
        <span className="font-label-md text-label-md text-on-surface-variant leading-snug">
          {current.icon} {current.text}
        </span>
      </div>
    </div>
  );
}
