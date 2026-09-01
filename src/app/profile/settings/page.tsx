import type { ReactNode } from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";

function Row({ icon, label, href }: { icon: string; label: string; href?: string }) {
  const content = (
    <>
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-outline">{icon}</span>
        <span className="font-body-lg text-body-lg text-on-surface">{label}</span>
      </div>
      <span className="material-symbols-outlined text-outline-variant">chevron_right</span>
    </>
  );
  const className = "w-full flex items-center justify-between p-md hover:bg-surface-container-low transition-colors";
  return href ? (
    <Link href={href} className={className}>
      {content}
    </Link>
  ) : (
    <button className={className}>{content}</button>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="font-label-md text-label-md text-outline uppercase tracking-wider mb-2 ml-4">{title}</h3>
      <div className="bg-surface-container-lowest rounded-[20px] soft-shadow divide-y divide-outline-variant/30 overflow-hidden">
        {children}
      </div>
    </section>
  );
}

export default function SettingsPage() {
  return (
    <div className="bg-background text-on-surface antialiased min-h-screen pb-32">
      <header className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-container-margin h-14 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/30">
        <Link href="/profile" aria-label="Retour" className="w-10 h-10 flex items-center justify-center text-primary hover:opacity-70 transition-opacity active:scale-95">
          <span className="material-symbols-outlined">arrow_back_ios</span>
        </Link>
        <h1 className="font-headline-sm text-headline-sm text-on-surface absolute left-1/2 -translate-x-1/2">Paramètres</h1>
        <div className="w-10 h-10" />
      </header>

      <main className="max-w-[800px] mx-auto pt-20 pb-8 px-container-margin flex flex-col gap-lg">
        <Section title="Préférences">
          <Row icon="notifications" label="Notifications" href="/profile/notifications" />
          <Row icon="language" label="Langue" />
        </Section>

        <Section title="Sécurité">
          <Row icon="key" label="Mot de passe" />
          <Row icon="devices" label="Connexion et appareils" />
          <Row icon="shield" label="Authentification renforcée" />
        </Section>

        <Section title="Confidentialité">
          <Row icon="lock" label="Confidentialité & Sécurité" href="/profile/privacy" />
          <Row icon="database" label="Gestion des données" />
          <Row icon="assignment_turned_in" label="Autorisations" />
        </Section>

        <Section title="Assistance">
          <Row icon="help" label="Aide" href="/help" />
          <Row icon="report" label="Signaler un problème" href="/profile/report" />
        </Section>

        <div className="flex flex-col items-center gap-4">
          <button className="w-full py-4 px-6 rounded-xl bg-error-container/30 text-error font-body-lg text-body-lg font-semibold active:scale-95 transition-transform">
            Déconnexion
          </button>
          <button className="font-label-md text-label-md text-outline hover:text-error transition-colors underline decoration-outline/30 underline-offset-4">
            Supprimer mon compte
          </button>
        </div>
      </main>

      <BottomNav active="profile" />
    </div>
  );
}
