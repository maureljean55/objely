import Link from "next/link";

const SECTIONS = [
  {
    title: "1. Objet",
    body: "Les présentes Conditions Générales d'Utilisation (CGU) définissent les règles d'accès et d'utilisation d'Objely, une plateforme mettant en relation les personnes ayant perdu un objet avec celles en ayant trouvé un. En créant un compte, vous acceptez ces conditions dans leur intégralité.",
  },
  {
    title: "2. Le service",
    body: "Objely permet de déclarer un objet perdu ou trouvé, de consulter les objets signalés par d'autres utilisateurs et d'échanger via la messagerie intégrée pour organiser une restitution. Objely agit comme intermédiaire technique et ne garantit pas qu'un objet perdu sera retrouvé.",
  },
  {
    title: "3. Compte utilisateur",
    body: "Vous devez fournir des informations exactes lors de l'inscription et êtes responsable de la confidentialité de vos identifiants. Un seul compte est autorisé par personne. Vous devez être en mesure de contracter légalement pour utiliser le service.",
  },
  {
    title: "4. Règles d'utilisation",
    body: "Les déclarations d'objets doivent être honnêtes et précises. Il est interdit de publier du contenu illicite, frauduleux, offensant ou portant atteinte aux droits d'autrui, de déclarer un objet qui ne vous appartient pas dans le but de le récupérer indûment, ou d'utiliser la messagerie à des fins autres que la restitution d'objets.",
  },
  {
    title: "5. Restitution des objets",
    body: "Les échanges entre utilisateurs (lieu, moyen de restitution) se font sous leur seule responsabilité. Objely recommande de toujours privilégier un lieu public et de ne jamais communiquer d'informations bancaires ou sensibles lors d'un échange.",
  },
  {
    title: "6. Modération et sanctions",
    body: "Objely se réserve le droit de suspendre ou supprimer un compte en cas de non-respect de ces CGU, de signalement fondé par d'autres utilisateurs, ou de comportement frauduleux, sans préavis en cas de manquement grave.",
  },
  {
    title: "7. Résiliation",
    body: "Vous pouvez supprimer votre compte à tout moment depuis les paramètres de l'application. La suppression entraîne l'effacement de vos données dans les conditions décrites dans notre page dédiée aux données personnelles.",
  },
  {
    title: "8. Modification des CGU",
    body: "Objely peut modifier ces CGU à tout moment pour refléter des évolutions du service ou de la réglementation. Les utilisateurs seront informés des changements significatifs.",
  },
  {
    title: "9. Loi applicable",
    body: "Les présentes CGU sont soumises au droit français. Tout litige relatif à leur interprétation ou leur exécution relève des tribunaux compétents.",
  },
];

export default function CguPage() {
  return (
    <div className="bg-gradient-to-b from-surface-container to-background text-on-background min-h-screen antialiased pb-12">
      <header className="sticky top-0 z-30 w-full bg-surface/80 backdrop-blur-xl shadow-sm flex items-center justify-between px-container-margin min-h-14 pt-[env(safe-area-inset-top)]">
        <Link href="/profile" aria-label="Retour" className="text-primary hover:opacity-70 transition-opacity active:scale-95 flex items-center justify-center w-10 h-10 -ml-2 rounded-full">
          <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 0" }}>arrow_back_ios</span>
        </Link>
        <h1 className="font-headline-sm text-headline-sm font-extrabold tracking-tight text-on-surface absolute left-1/2 -translate-x-1/2">
          Conditions générales
        </h1>
        <div
          className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-white shadow-sm"
          style={{ background: "linear-gradient(135deg, #0058bc, #5952af)" }}
        >
          <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>gavel</span>
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
            gavel
          </span>
        </div>
        <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-2">
          Conditions générales d&apos;utilisation
        </h2>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-[340px]">
          Les règles qui encadrent l&apos;utilisation d&apos;Objely, pour un service sûr et de confiance pour tous.
        </p>
      </section>

      <main className="max-w-2xl mx-auto px-container-margin flex flex-col gap-lg">
        {SECTIONS.map((section) => (
          <section key={section.title} className="bg-surface-container-lowest rounded-[28px] soft-shadow px-lg py-5">
            <h3 className="font-headline-md text-headline-md text-on-surface font-bold mb-2">{section.title}</h3>
            <p className="font-body-md text-body-md text-on-surface-variant">{section.body}</p>
          </section>
        ))}

        <Link
          href="/rgpd"
          className="bg-surface-container-lowest rounded-[28px] soft-shadow px-lg py-5 flex items-center justify-between gap-md hover:bg-black/[0.02] transition-colors"
        >
          <div>
            <h4 className="font-headline-md text-headline-md text-on-surface font-bold mb-1">Données personnelles</h4>
            <p className="font-body-md text-body-md text-on-surface-variant">Consultez notre politique de confidentialité (RGPD)</p>
          </div>
          <span
            className="w-9 h-9 rounded-full flex items-center justify-center text-white shrink-0 shadow-sm"
            style={{ background: "linear-gradient(135deg, #0058bc, #5952af)" }}
          >
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>privacy_tip</span>
          </span>
        </Link>

        <p className="font-label-md text-[11px] text-outline text-center mt-2">Dernière mise à jour : septembre 2026.</p>
      </main>
    </div>
  );
}
