import Link from "next/link";

const CONVERSATIONS = [
  {
    id: "restitution",
    href: "/help/chat",
    icon: "support_agent",
    iconBg: "bg-primary-container text-on-primary-container",
    online: true,
    name: "Support Objely",
    time: "Il y a 15 min",
    subject: "Problème avec une restitution",
    status: "En cours",
    statusClass: "bg-primary-fixed text-on-primary-fixed-variant",
  },
  {
    id: "portefeuille",
    href: "/help/chat-item",
    icon: "account_balance_wallet",
    iconBg: "bg-surface-variant text-on-surface-variant",
    online: false,
    name: "Service Client",
    time: "Hier",
    subject: "Correspondance pour mon portefeuille",
    status: "Résolu",
    statusClass: "bg-surface-variant text-on-surface-variant",
  },
];

export default function HelpHistoryPage() {
  return (
    <div className="bg-background text-on-surface min-h-screen flex flex-col antialiased">
      <header className="sticky top-0 w-full z-30 bg-surface/80 backdrop-blur-xl shadow-sm flex items-center justify-between px-container-margin h-14">
        <Link href="/help" aria-label="Retour" className="flex items-center justify-center p-2 -ml-2 text-primary hover:opacity-70 active:scale-95 transition-transform">
          <span className="material-symbols-outlined text-2xl">arrow_back_ios</span>
        </Link>
        <h1 className="font-headline-sm text-headline-sm text-on-surface absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0">
          Mes conversations
        </h1>
        <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-primary">
          <span className="font-label-md text-label-md font-bold">SA</span>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[800px] mx-auto px-container-margin pt-lg pb-xl">
        <div className="mb-lg">
          <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-2">Historique</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Retrouvez toutes vos demandes d&apos;assistance Objely.</p>
        </div>

        <ul className="flex flex-col rounded-xl overflow-hidden bg-surface-container-lowest border border-outline-variant/30 shadow-sm">
          {CONVERSATIONS.map((conv, i) => (
            <li key={conv.id} className={i < CONVERSATIONS.length - 1 ? "border-b border-outline-variant/30" : ""}>
              <Link href={conv.href} className="block px-md py-4 hover:bg-surface-container-low transition-colors">
                <div className="flex items-start gap-4">
                  <div className="relative shrink-0 mt-1">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${conv.iconBg}`}>
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>{conv.icon}</span>
                    </div>
                    {conv.online && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-surface-container-lowest rounded-full flex items-center justify-center">
                        <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-label-md text-label-md text-on-surface font-semibold truncate pr-2">{conv.name}</span>
                      <span className="font-label-md text-[11px] text-outline shrink-0">{conv.time}</span>
                    </div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface truncate mb-1.5">{conv.subject}</h3>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-label-md text-[11px] ${conv.statusClass}`}>
                      {conv.status}
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
