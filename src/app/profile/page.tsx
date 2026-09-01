import BottomNav from "@/components/BottomNav";

const STATS = [
  { value: "3", label: "Objets\nsignalés", color: "text-primary" },
  { value: "2", label: "Objets\ntrouvés", color: "text-secondary" },
  { value: "2", label: "Retrouvés", color: "text-tertiary" },
];

const MENU_ITEMS = [
  { icon: "person", label: "Paramètres du compte", bg: "bg-primary-fixed/30", color: "text-primary" },
  { icon: "inventory_2", label: "Mes Objets", bg: "bg-secondary-fixed/30", color: "text-secondary" },
  { icon: "lock", label: "Confidentialité & Sécurité", bg: "bg-tertiary-fixed/30", color: "text-tertiary" },
  { icon: "notifications", label: "Notifications", bg: "bg-primary-fixed/30", color: "text-primary" },
  { icon: "help", label: "Centre d'aide", bg: "bg-secondary-fixed/30", color: "text-secondary" },
  { icon: "flag", label: "Signaler un problème", bg: "bg-surface-variant/50", color: "text-on-surface-variant" },
];

export default function UserProfilePage() {
  return (
    <div className="bg-background text-on-surface antialiased pb-[100px]">
      <header className="hidden md:flex justify-between items-center w-full px-container-margin py-base max-w-7xl mx-auto bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="font-display text-display text-primary">Objely</div>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-surface-variant overflow-hidden" />
          <span className="font-headline-sm text-headline-sm text-primary">Bonjour 👋</span>
          <button className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:opacity-80 transition-opacity">
            <span className="material-symbols-outlined">notifications</span>
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto md:mt-8 px-container-margin md:px-0">
        <section className="flex flex-col items-center pt-8 pb-6 animate-fadeIn">
          <div className="relative mb-4">
            <div className="w-28 h-28 rounded-full overflow-hidden soft-shadow ring-4 ring-surface-container-lowest bg-surface-container-high">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="w-full h-full object-cover"
                alt="Julie Bertrand"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCZfuwmAGmqsioZXn2vl0S5TeziGs1iRvYxOAMNX1PWzii9KRcgCccoERwU1Dj76e0-cAN4M1_1ws_bjeZmtSxzXtieAa2J7ngwaqInqx_rnuPJJ3W5dj_MCvXoNG0YdF_6oyDqnRm6zIuhi6ii40MgIjkG5rsKX0XWiP40a5Eu8sK6GuUecMT6pJPUQbKbX9MSI_u1c4V0_o8xVv6hlzkKug9iRIUbUXwp-O7ITLOaaSCSmax9QdFC"
              />
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-surface-container-lowest rounded-full shadow-md flex items-center justify-center text-primary hover:bg-surface-variant transition-colors border border-surface-container">
              <span className="material-symbols-outlined text-[18px]">edit</span>
            </button>
          </div>
          <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-1">
            Julie Bertrand
          </h1>
          <div className="flex items-center gap-2 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50 rounded-full px-4 py-1.5 shadow-sm mt-2">
            <span className="material-symbols-outlined text-amber-500 text-[18px] drop-shadow-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
              shield
            </span>
            <span className="font-label-md text-label-md text-amber-700">Niveau de confiance : Or (98%)</span>
          </div>
        </section>

        <section className="grid grid-cols-3 gap-3 mb-8 animate-slideUp">
          {STATS.map((stat) => (
            <div key={stat.label} className="bg-surface-container-lowest rounded-[24px] p-4 flex flex-col items-center justify-center soft-shadow inner-stroke">
              <span className={`font-headline-lg-mobile text-headline-lg-mobile mb-1 ${stat.color}`}>{stat.value}</span>
              <span className="font-label-md text-label-md text-on-surface-variant text-center leading-tight whitespace-pre-line">{stat.label}</span>
            </div>
          ))}
        </section>

        <section className="bg-surface-container-lowest rounded-[32px] soft-shadow inner-stroke overflow-hidden mb-8 animate-slideUp">
          <div className="flex flex-col">
            {MENU_ITEMS.map((item, i) => (
              <button
                key={item.label}
                className={`w-full flex items-center justify-between p-lg text-left hover:bg-black/[0.02] transition-colors ${
                  i < MENU_ITEMS.length - 1 ? "border-b border-surface-variant/50" : ""
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.bg} ${item.color}`}>
                    <span className="material-symbols-outlined">{item.icon}</span>
                  </div>
                  <span className="font-body-lg text-body-lg text-on-surface">{item.label}</span>
                </div>
                <span className="material-symbols-outlined text-outline-variant">chevron_right</span>
              </button>
            ))}
          </div>
        </section>

        <section className="flex flex-col items-center gap-6 mb-12 animate-slideUp">
          <button className="w-full max-w-[300px] min-h-[56px] bg-surface-container-lowest rounded flex items-center justify-center gap-2 font-headline-sm text-headline-sm text-error border border-error-container hover:bg-error-container/20 transition-colors soft-shadow">
            <span className="material-symbols-outlined">logout</span>
            Déconnexion
          </button>
          <button className="font-label-md text-label-md text-outline hover:text-error transition-colors underline decoration-outline/30 underline-offset-4">
            Supprimer mon compte
          </button>
        </section>
      </main>

      <BottomNav active="profile" />
    </div>
  );
}
