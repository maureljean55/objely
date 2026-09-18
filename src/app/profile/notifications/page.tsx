"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import Switch from "@/components/Switch";
import { getMyProfile, updateNotificationPrefs, type NotificationPrefs } from "@/lib/supabase/profile";

const DEFAULT_PREFS: NotificationPrefs = {
  notify_matches: true,
  notify_messages: true,
  notify_verifications: true,
  notify_restitutions: true,
};

export default function NotificationsPage() {
  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_PREFS);
  const [isLoading, setIsLoading] = useState(true);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    getMyProfile().then(({ data }) => {
      if (data) {
        setPrefs({
          notify_matches: data.notify_matches,
          notify_messages: data.notify_messages,
          notify_verifications: data.notify_verifications,
          notify_restitutions: data.notify_restitutions,
        });
      }
      setIsLoading(false);
    });
  }, []);

  const toggle = async (key: keyof NotificationPrefs, value: boolean) => {
    const previous = prefs[key];
    setSaveError(null);
    setPrefs((p) => ({ ...p, [key]: value }));
    const { error } = await updateNotificationPrefs({ [key]: value });
    if (error) {
      setPrefs((p) => ({ ...p, [key]: previous }));
      setSaveError("Une erreur est survenue, réessayez.");
    }
  };

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
        {saveError && (
          <p className="font-body-md text-[13px] text-error bg-error-container/40 rounded-xl px-4 py-2 text-center">{saveError}</p>
        )}

        <section>
          <h3 className="font-label-md text-label-md text-primary mb-2 uppercase tracking-wider pl-1">Objets</h3>
          <div className="bg-surface-container-lowest rounded-xl soft-shadow divide-y divide-outline-variant/30 overflow-hidden">
            <div className="flex justify-between items-center p-4">
              <span className="font-body-lg text-body-lg">Nouvelle correspondance</span>
              <Switch checked={prefs.notify_matches} onChange={(v) => toggle("notify_matches", v)} disabled={isLoading} />
            </div>
          </div>
        </section>

        <section>
          <h3 className="font-label-md text-label-md text-primary mb-2 uppercase tracking-wider pl-1">Messages</h3>
          <div className="bg-surface-container-lowest rounded-xl soft-shadow divide-y divide-outline-variant/30 overflow-hidden">
            <div className="flex justify-between items-center p-4">
              <span className="font-body-lg text-body-lg">Nouveau message</span>
              <Switch checked={prefs.notify_messages} onChange={(v) => toggle("notify_messages", v)} disabled={isLoading} />
            </div>
          </div>
        </section>

        <section>
          <h3 className="font-label-md text-label-md text-primary mb-2 uppercase tracking-wider pl-1">Vérification</h3>
          <div className="bg-surface-container-lowest rounded-xl soft-shadow divide-y divide-outline-variant/30 overflow-hidden">
            <div className="flex justify-between items-center p-4">
              <span className="font-body-lg text-body-lg">Réponses et décisions de vérification</span>
              <Switch checked={prefs.notify_verifications} onChange={(v) => toggle("notify_verifications", v)} disabled={isLoading} />
            </div>
          </div>
        </section>

        <section>
          <h3 className="font-label-md text-label-md text-primary mb-2 uppercase tracking-wider pl-1">Restitution</h3>
          <div className="bg-surface-container-lowest rounded-xl soft-shadow divide-y divide-outline-variant/30 overflow-hidden">
            <div className="flex justify-between items-center p-4">
              <span className="font-body-lg text-body-lg">Rendez-vous et confirmations</span>
              <Switch checked={prefs.notify_restitutions} onChange={(v) => toggle("notify_restitutions", v)} disabled={isLoading} />
            </div>
          </div>
        </section>

        <Link
          href="/notifications"
          className="flex items-center justify-between bg-surface-container-lowest p-4 rounded-xl soft-shadow font-body-lg text-body-lg text-primary font-semibold hover:opacity-80 transition-opacity"
        >
          Voir l&apos;historique des notifications
          <span className="material-symbols-outlined">chevron_right</span>
        </Link>
      </main>

      <BottomNav active="profile" />
    </div>
  );
}
