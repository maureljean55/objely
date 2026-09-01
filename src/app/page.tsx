import Link from "next/link";
import BottomNav from "@/components/BottomNav";

const RECENT_ITEMS = [
  {
    id: "iphone-14-pro",
    title: "iPhone 14 Pro Noir",
    category: "Électronique",
    categoryIcon: "smartphone",
    time: "Il y a 2 heures",
    distance: "À 200m",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDcKlnzfvaN-bmeuUIGJ4gfRF2ko9IvqtgDqtgdYkukq_BDKZFzXLxulEcuYXV1uhmP-PsSG0byBv4dxCPU5alrDsE7J2eVzRGXpQk8MVoRdo-vRhfWbNSFrvVqgViJTsa6T8mQvVRjNkmobZ8V7D9tRwz8IxlkQE6OgEjxpTd4-Urlfx01o0aeIadJDQEYUPyI_WQ4Zian0mW4_5w-pN4eOWdUyZjNnHBhzM11Zka02iKlUM1y2qru",
  },
  {
    id: "portefeuille-cuir",
    title: "Portefeuille en cuir marron",
    category: "Accessoires",
    categoryIcon: "wallet",
    time: "Hier",
    distance: "À 1.2km",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAVZe46M5x8qXC3h2DOyPoXkYVWeSoWvUI435nRmzIEN1--7pMtaNWlk5Q1VgJPLx5-9u1tGeX6RXZVid3X_lCQXQXvJ4RONcKjQgHs1xyix2HmYk3xP2Q_6HqqILnEqmy7OYiTPFbfsmrEDqLL_A5nESIp-crOQwnTx7lX1jycLQKt2M4SCAdqpKh8mf_5vnYQeena3JPsC1iX82LLXIUKK838cpHi4nelFNdi4dimAk59ayExXFzs",
  },
  {
    id: "trousseau-cles",
    title: "Trousseau de clés avec lanière",
    category: "Clés",
    categoryIcon: "key",
    time: "Lun. 14 Oct",
    distance: "À 2.5km",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDRK6RucXPJII7ghVP1FXYAI2ytBS__UWmYa2iiETABeSVJqpxj3iWXUCwWBCV5Sz_p6NBL4CYb6QkyBCp1p4CRyPouWdW6rxgy-MKt-KYY04jPEwwNFU6uGwS7TD6z698rbVfMumjyyrOtMNvzQDsb3MwaBO5W7pnuiWW3A-h-Czp_KEL39k9CvRZmq-fCKY2UEwdOgwHZBVybPVuVSNEJaFyhJ3zZRK4buS_1LriA6D8G7pp7uEwl",
  },
];

export default function HomeDashboardPage() {
  return (
    <div className="pb-[100px] md:pb-0 md:pt-[100px]">
      {/* TopAppBar (desktop) */}
      <header className="hidden md:flex justify-between items-center w-full px-container-margin py-base max-w-7xl mx-auto fixed top-0 z-50 bg-background/80 backdrop-blur-md">
        <div className="flex items-center gap-sm">
          <div className="w-10 h-10 rounded-full overflow-hidden surface-card shrink-0 bg-surface-container-high" />
          <h1 className="font-headline-md text-headline-md text-primary">Bonjour 👋</h1>
        </div>
        <nav className="flex gap-gutter">
          <Link className="text-primary font-label-md text-label-md hover:opacity-80 transition-opacity flex flex-col items-center" href="/">
            <span className="material-symbols-outlined mb-1" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
            Home
          </Link>
          <Link className="text-on-surface-variant font-label-md text-label-md hover:opacity-80 transition-opacity flex flex-col items-center" href="/search">
            <span className="material-symbols-outlined mb-1">search</span>
            Search
          </Link>
          <Link className="text-on-surface-variant font-label-md text-label-md hover:opacity-80 transition-opacity flex flex-col items-center" href="/report-lost">
            <span className="material-symbols-outlined mb-1">add_circle</span>
            Declare
          </Link>
          <Link className="text-on-surface-variant font-label-md text-label-md hover:opacity-80 transition-opacity flex flex-col items-center" href="/chat">
            <span className="material-symbols-outlined mb-1">chat_bubble</span>
            Messages
          </Link>
          <Link className="text-on-surface-variant font-label-md text-label-md hover:opacity-80 transition-opacity flex flex-col items-center" href="/profile">
            <span className="material-symbols-outlined mb-1">person</span>
            Profile
          </Link>
        </nav>
        <button className="text-on-surface-variant hover:opacity-80 transition-opacity w-10 h-10 flex items-center justify-center rounded-full surface-card">
          <span className="material-symbols-outlined">notifications</span>
        </button>
      </header>

      <main className="max-w-7xl mx-auto px-container-margin md:px-lg pt-lg md:pt-xl space-y-xl">
        {/* Mobile Header */}
        <div className="md:hidden flex justify-between items-center">
          <div>
            <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-background mb-1">Bonjour 👋</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">Quelque chose à retrouver ?</p>
          </div>
          <div className="w-12 h-12 rounded-full overflow-hidden surface-card shrink-0 bg-surface-container-high" />
        </div>
        <div className="hidden md:block">
          <p className="font-headline-sm text-headline-sm text-on-surface-variant">Quelque chose à retrouver ?</p>
        </div>

        {/* Primary Action Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-md md:gap-lg">
          <Link
            href="/report-lost"
            className="group relative overflow-hidden rounded-[24px] bg-primary h-[200px] md:h-[240px] shadow-lg flex flex-col justify-end p-lg text-left transition-transform hover:scale-[0.98] active:scale-[0.95]"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10" />
            <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl z-0 pointer-events-none group-hover:scale-110 transition-transform duration-700" />
            <div className="relative z-20 flex justify-between items-end w-full">
              <div>
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-md">
                  <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>search</span>
                </div>
                <h2 className="font-headline-md text-headline-md text-white mb-1">J&apos;ai perdu un objet</h2>
                <p className="font-body-md text-body-md text-white/80">Lancer une recherche</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                <span className="material-symbols-outlined text-primary text-sm">arrow_forward</span>
              </div>
            </div>
          </Link>
          <Link
            href="/report-lost"
            className="group relative overflow-hidden rounded-[24px] bg-secondary h-[200px] md:h-[240px] shadow-lg flex flex-col justify-end p-lg text-left transition-transform hover:scale-[0.98] active:scale-[0.95]"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10" />
            <div className="absolute top-[-20%] left-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl z-0 pointer-events-none group-hover:scale-110 transition-transform duration-700" />
            <div className="relative z-20 flex justify-between items-end w-full">
              <div>
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-md">
                  <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>add_circle</span>
                </div>
                <h2 className="font-headline-md text-headline-md text-white mb-1">J&apos;ai trouvé un objet</h2>
                <p className="font-body-md text-body-md text-white/80">Signaler une découverte</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                <span className="material-symbols-outlined text-secondary text-sm">arrow_forward</span>
              </div>
            </div>
          </Link>
        </section>

        {/* Recent Finds */}
        <section className="space-y-md">
          <div className="flex justify-between items-end">
            <h3 className="font-headline-sm text-headline-sm text-on-background">Objets récemment trouvés près de vous</h3>
            <Link className="font-label-md text-label-md text-primary hover:underline" href="/search">Voir tout</Link>
          </div>
          <div className="flex overflow-x-auto md:grid md:grid-cols-3 gap-md pb-md hide-scrollbar -mx-container-margin px-container-margin md:mx-0 md:px-0">
            {RECENT_ITEMS.map((item) => (
              <Link
                key={item.id}
                href="/matching"
                className="surface-card rounded-[24px] min-w-[240px] md:min-w-0 shrink-0 flex flex-col overflow-hidden group cursor-pointer hover:shadow-xl transition-shadow duration-300"
              >
                <div className="relative h-40 bg-surface-container-high overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    src={item.image}
                  />
                  <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-10">
                    <div className="px-3 py-1 rounded-full bg-[#A29BFE]/15 backdrop-blur-md border border-[#A29BFE]/30 text-[#A29BFE] font-label-md text-xs flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">{item.categoryIcon}</span>
                      {item.category}
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-primary shadow-sm">
                      <span className="material-symbols-outlined text-[18px]">location_on</span>
                    </div>
                  </div>
                </div>
                <div className="p-md flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-headline-sm text-headline-sm text-on-background line-clamp-1 mb-1">{item.title}</h4>
                    <p className="font-body-md text-body-md text-on-surface-variant flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">schedule</span>
                      {item.time}
                    </p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-surface-variant flex items-center justify-between">
                    <span className="font-label-md text-label-md text-primary">{item.distance}</span>
                    <span className="text-primary p-2 rounded-full">
                      <span className="material-symbols-outlined">arrow_forward</span>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <BottomNav active="home" />
    </div>
  );
}
