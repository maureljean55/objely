import type { ReactNode } from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import ThemeToggle from "@/components/ThemeToggle";

const AVATAR =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCZfuwmAGmqsioZXn2vl0S5TeziGs1iRvYxOAMNX1PWzii9KRcgCccoERwU1Dj76e0-cAN4M1_1ws_bjeZmtSxzXtieAa2J7ngwaqInqx_rnuPJJ3W5dj_MCvXoNG0YdF_6oyDqnRm6zIuhi6ii40MgIjkG5rsKX0XWiP40a5Eu8sK6GuUecMT6pJPUQbKbX9MSI_u1c4V0_o8xVv6hlzkKug9iRIUbUXwp-O7ITLOaaSCSmax9QdFC";

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
        <section className="bg-surface-container-lowest rounded-[20px] soft-shadow p-4 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-surface-container-high shrink-0 border border-outline-variant/50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt="Julie Bertrand" className="w-full h-full object-cover" src={AVATAR} />
          </div>
          <div className="flex-1">
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Julie Bertrand</h2>
            <p className="font-body-md text-body-md text-outline">julie.bertrand@example.com</p>
          </div>
        </section>

        <Section title="Compte">
          <Row icon="person" label="Modifier mon profil" href="/profile/edit" />
          <Row icon="mail" label="Adresse e-mail" />
          <Row icon="phone_iphone" label="Numéro de téléphone" />
        </Section>

        <Section title="Préférences">
          <Row icon="notifications" label="Notifications" href="/profile/notifications" />
          <Row icon="language" label="Langue" />
          <ThemeToggle />
          <Row icon="location_on" label="Localisation" />
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

        <button className="w-full py-4 px-6 rounded-xl bg-error-container/30 text-error font-body-lg text-body-lg font-semibold active:scale-95 transition-transform">
          Déconnexion
        </button>
      </main>

      <BottomNav active="profile" />
    </div>
  );
}
