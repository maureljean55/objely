import Link from "next/link";

const DATA_COLLECTED = [
  { icon: "mail", label: "Email et identifiants de connexion" },
  { icon: "badge", label: "Nom, prénom et photo de profil" },
  { icon: "photo_camera", label: "Photos des objets déclarés perdus ou trouvés" },
  { icon: "location_on", label: "Localisation (approximative ou précise selon vos réglages)" },
  { icon: "chat", label: "Messages échangés avec d'autres utilisateurs" },
];

const RIGHTS = [
  { icon: "visibility", title: "Droit d'accès", body: "Consulter les données que nous détenons sur vous." },
  { icon: "edit", title: "Droit de rectification", body: "Corriger une information inexacte ou incomplète." },
  { icon: "delete", title: "Droit à l'effacement", body: "Demander la suppression de votre compte et de vos données." },
  { icon: "download", title: "Droit à la portabilité", body: "Récupérer vos données dans un format exploitable." },
  { icon: "block", title: "Droit d'opposition", body: "Vous opposer à un traitement de vos données." },
];

export default function RgpdPage() {
  return (
    <div className="bg-gradient-to-b from-surface-container to-background text-on-background min-h-screen antialiased pb-12">
      <header className="sticky top-0 z-30 w-full bg-surface/80 backdrop-blur-xl shadow-sm flex items-center justify-between px-container-margin min-h-14 pt-[env(safe-area-inset-top)]">
        <Link href="/profile" aria-label="Retour" className="text-primary hover:opacity-70 transition-opacity active:scale-95 flex items-center justify-center w-10 h-10 -ml-2 rounded-full">
          <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 0" }}>arrow_back_ios</span>
        </Link>
        <h1 className="font-headline-sm text-headline-sm font-extrabold tracking-tight text-on-surface absolute left-1/2 -translate-x-1/2">
          Données personnelles
        </h1>
        <div
          className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-white shadow-sm"
          style={{ background: "linear-gradient(135deg, #0058bc, #5952af)" }}
        >
          <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>privacy_tip</span>
        </div>
      </header>

      {/* Hero */}
      <section className="flex flex-col items-center text-center px-6 pt-10 pb-8 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 bg-primary-fixed/40 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mb-5 shadow-lg"
          style={{ background: "linear-gradient(135deg, #0058bc, #5952af)" }}
        >
          <span className="material-symbols-outlined text-[40px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>
            shield_lock
          </span>
        </div>
        <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-2">
          Vos données vous appartiennent
        </h2>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-[340px]">
          Objely respecte le Règlement Général sur la Protection des Données (RGPD). Voici ce que nous collectons, pourquoi, et comment garder le contrôle.
        </p>
      </section>

      <main className="max-w-2xl mx-auto px-container-margin flex flex-col gap-lg">
        {/* Ce que nous collectons */}
        <section className="bg-surface-container-lowest rounded-[28px] soft-shadow overflow-hidden">
          <div className="px-lg py-4 border-b border-outline-variant/30">
            <h3 className="font-headline-md text-headline-md text-on-surface font-bold">Ce que nous collectons</h3>
          </div>
          <div className="divide-y divide-outline-variant/30">
            {DATA_COLLECTED.map((item) => (
              <div key={item.label} className="flex items-center gap-3 px-lg py-4">
                <span
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white shrink-0"
                  style={{ background: "linear-gradient(135deg, #0058bc, #5952af)" }}
                >
                  <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                </span>
                <span className="font-body-md text-body-md text-on-surface">{item.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Pourquoi */}
        <section className="bg-surface-container-lowest rounded-[28px] soft-shadow px-lg py-5">
          <h3 className="font-headline-md text-headline-md text-on-surface font-bold mb-2">Pourquoi nous les utilisons</h3>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Uniquement pour vous mettre en relation avec la bonne personne lors d&apos;une déclaration d&apos;objet perdu ou trouvé, sécuriser les échanges entre
            utilisateurs et améliorer le service. Vos données ne sont jamais vendues à des tiers.
          </p>
        </section>

        {/* Conservation */}
        <section className="bg-surface-container-lowest rounded-[28px] soft-shadow px-lg py-5">
          <h3 className="font-headline-md text-headline-md text-on-surface font-bold mb-2">Durée de conservation</h3>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Vos données sont conservées tant que votre compte est actif. En cas de suppression de compte, elles sont effacées sous 30 jours, sauf obligation
            légale de conservation plus longue.
          </p>
        </section>

        {/* Vos droits */}
        <section className="bg-surface-container-lowest rounded-[28px] soft-shadow overflow-hidden">
          <div className="px-lg py-4 border-b border-outline-variant/30">
            <h3 className="font-headline-md text-headline-md text-on-surface font-bold">Vos droits</h3>
          </div>
          <div className="divide-y divide-outline-variant/30">
            {RIGHTS.map((right) => (
              <div key={right.title} className="flex items-start gap-3 px-lg py-4">
                <span className="material-symbols-outlined text-primary shrink-0 mt-0.5">{right.icon}</span>
                <div>
                  <h4 className="font-body-lg text-body-lg text-on-surface font-semibold">{right.title}</h4>
                  <p className="font-body-md text-body-md text-on-surface-variant">{right.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Actions */}
        <section className="flex flex-col gap-md">
          <Link
            href="/help/chat"
            className="bg-surface-container-lowest rounded-[28px] soft-shadow px-lg py-5 flex items-center justify-between gap-md hover:bg-black/[0.02] transition-colors"
          >
            <div>
              <h4 className="font-headline-md text-headline-md text-on-surface font-bold mb-1">Exercer un droit</h4>
              <p className="font-body-md text-body-md text-on-surface-variant">Contactez-nous pour accéder, corriger ou exporter vos données</p>
            </div>
            <span
              className="w-9 h-9 rounded-full flex items-center justify-center text-white shrink-0 shadow-sm"
              style={{ background: "linear-gradient(135deg, #0058bc, #5952af)" }}
            >
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
            </span>
          </Link>

          <Link
            href="/profile/settings"
            className="bg-surface-container-lowest rounded-[28px] soft-shadow px-lg py-5 flex items-center justify-between gap-md hover:bg-black/[0.02] transition-colors"
          >
            <div>
              <h4 className="font-headline-md text-headline-md text-on-surface font-bold mb-1">Supprimer mon compte</h4>
              <p className="font-body-md text-body-md text-on-surface-variant">Efface définitivement votre compte et vos données</p>
            </div>
            <span className="w-9 h-9 rounded-full flex items-center justify-center text-error shrink-0 bg-error-container/30">
              <span className="material-symbols-outlined text-[20px]">delete</span>
            </span>
          </Link>
        </section>

        <p className="font-label-md text-[11px] text-outline text-center mt-2">
          Conforme au Règlement (UE) 2016/679 (RGPD). Dernière mise à jour : septembre 2026.
        </p>
      </main>
    </div>
  );
}
