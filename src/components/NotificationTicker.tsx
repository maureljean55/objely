"use client";

import { useEffect, useState } from "react";

const PREVENTION_MESSAGES = [
  { icon: "🛡️", text: "Donnez rendez-vous uniquement dans des lieux publics et fréquentés" },
  { icon: "⚠️", text: "Objely ne vous empêche pas de déclarer un objet dans un lieu réputé à risque — restez vigilant" },
  { icon: "🚫", text: "Ne partagez jamais vos coordonnées bancaires dans une conversation" },
  { icon: "🔍", text: "Vérifiez toujours les détails avant de confirmer une restitution" },
  { icon: "👥", text: "Privilégiez un échange accompagné ou en journée" },
  { icon: "🚨", text: "Signalez tout comportement suspect depuis la fiche de l'objet" },
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
    <div className="bg-surface-container-lowest rounded-full shadow-sm px-4 py-2.5 overflow-hidden">
      <div key={index} className="flex items-center gap-2 animate-fadeIn">
        <span className="font-label-md text-label-md text-on-surface-variant truncate">
          {current.icon} {current.text}
        </span>
      </div>
    </div>
  );
}
