"use client";

import { useState } from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import Switch from "@/components/Switch";

const HISTORY = [
  { emoji: "🎯", bg: "bg-primary-fixed", text: "Une correspondance possible a été trouvée.", time: "Il y a 2 heures" },
  { emoji: "💬", bg: "bg-secondary-fixed", text: "Vous avez reçu un nouveau message.", time: "Hier" },
  { emoji: "🎉", bg: "bg-error-container", text: "Votre objet a été retrouvé.", time: "Il y a 3 jours" },
];

export default function NotificationsPage() {
  const [master, setMaster] = useState(true);
  const [objMatch, setObjMatch] = useState(true);
  const [objNearby, setObjNearby] = useState(true);
  const [objUpdate, setObjUpdate] = useState(false);
  const [msgNew, setMsgNew] = useState(true);
  const [msgReturn, setMsgReturn] = useState(true);
  const [msgConfirm, setMsgConfirm] = useState(true);
  const [secLogin, setSecLogin] = useState(false);
  const [secActivity, setSecActivity] = useState(true);

  return (
    <div className="bg-background text-on-surface antialiased min-h-screen pb-32">
      <header className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-container-margin min-h-14 pt-[env(safe-area-inset-top)] bg-surface/80 backdrop-blur-xl border-b border-outline-variant/30">
        <Link href="/profile" aria-label="Retour" className="flex items-center text-primary hover:opacity-70 transition-opacity active:scale-95">
          <span className="material-symbols-outlined">arrow_back_ios</span>
        </Link>
        <h1 className="font-headline-sm text-headline-sm text-primary text-center flex-1 font-semibold">Notifications</h1>
        <Link href="/profile/settings" aria-label="Paramètres" className="flex items-center text-primary hover:opacity-70 transition-opacity active:scale-95">
          <span className="material-symbols-outlined">settings</span>
        </Link>
      </header>

      <main className="max-w-2xl mx-auto px-container-margin pt-[calc(5rem+env(safe-area-inset-top))] pb-8 flex flex-col gap-xl">
        <section className="bg-surface-container-lowest rounded-xl soft-shadow p-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-body-lg text-body-lg font-semibold">Autoriser les notifications</h2>
            <Switch checked={master} onChange={setMaster} />
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Les notifications vous permettent de ne manquer aucune information importante concernant vos objets perdus ou trouvés.
          </p>
        </section>

        <section>
          <h3 className="font-label-md text-label-md text-primary mb-2 uppercase tracking-wider pl-1">Objets</h3>
          <div className="bg-surface-container-lowest rounded-xl soft-shadow divide-y divide-outline-variant/30 overflow-hidden">
            <div className="flex justify-between items-center p-4">
              <span className="font-body-lg text-body-lg">Nouvelle correspondance</span>
              <Switch checked={objMatch} onChange={setObjMatch} />
            </div>
            <div className="flex justify-between items-center p-4">
              <span className="font-body-lg text-body-lg">Objet trouvé à proximité</span>
              <Switch checked={objNearby} onChange={setObjNearby} />
            </div>
            <div className="flex justify-between items-center p-4">
              <span className="font-body-lg text-body-lg">Mise à jour de ma recherche</span>
              <Switch checked={objUpdate} onChange={setObjUpdate} />
            </div>
          </div>
        </section>

        <section>
          <h3 className="font-label-md text-label-md text-primary mb-2 uppercase tracking-wider pl-1">Messages</h3>
          <div className="bg-surface-container-lowest rounded-xl soft-shadow divide-y divide-outline-variant/30 overflow-hidden">
            <div className="flex justify-between items-center p-4">
              <span className="font-body-lg text-body-lg">Nouveau message</span>
              <Switch checked={msgNew} onChange={setMsgNew} />
            </div>
            <div className="flex justify-between items-center p-4">
              <span className="font-body-lg text-body-lg">Demande de restitution</span>
              <Switch checked={msgReturn} onChange={setMsgReturn} />
            </div>
            <div className="flex justify-between items-center p-4">
              <span className="font-body-lg text-body-lg">Confirmation de rencontre</span>
              <Switch checked={msgConfirm} onChange={setMsgConfirm} />
            </div>
          </div>
        </section>

        <section>
          <h3 className="font-label-md text-label-md text-primary mb-2 uppercase tracking-wider pl-1">Sécurité</h3>
          <div className="bg-surface-container-lowest rounded-xl soft-shadow divide-y divide-outline-variant/30 overflow-hidden">
            <div className="flex justify-between items-center p-4">
              <span className="font-body-lg text-body-lg">Nouvelle connexion</span>
              <Switch checked={secLogin} onChange={setSecLogin} />
            </div>
            <div className="flex justify-between items-center p-4">
              <span className="font-body-lg text-body-lg">Activité inhabituelle</span>
              <Switch checked={secActivity} onChange={setSecActivity} />
            </div>
          </div>
        </section>

        <section>
          <h3 className="font-label-md text-label-md text-primary mb-2 uppercase tracking-wider pl-1">Historique récent</h3>
          <div className="flex flex-col gap-2">
            {HISTORY.map((item) => (
              <div key={item.text} className="flex items-start gap-4 bg-surface-container-lowest p-4 rounded-xl soft-shadow">
                <div className={`w-10 h-10 rounded-full ${item.bg} flex items-center justify-center shrink-0`}>
                  <span className="text-xl">{item.emoji}</span>
                </div>
                <div>
                  <p className="font-body-lg text-body-lg font-medium">{item.text}</p>
                  <p className="font-label-md text-[11px] text-on-surface-variant mt-1">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <BottomNav active="profile" />
    </div>
  );
}
