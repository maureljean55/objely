import Link from "next/link";
import BottomNav from "@/components/BottomNav";

const RECENT_ACTIVITY = [
  "🔑 Clés trouvées à Paris 11e",
  "il y a 5 min",
  "👜 Sac restitué à son propriétaire",
  "il y a 1 h",
  "📱 Nouvelle correspondance trouvée",
  "il y a 3 h",
];

const RECENT_ITEMS = [
  {
    id: "cles-voiture-audi",
    title: "Clés de voiture Audi",
    location: "Paris 11e",
    dotColor: "#5952af",
    time: "il y a 2 heures",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDRK6RucXPJII7ghVP1FXYAI2ytBS__UWmYa2iiETABeSVJqpxj3iWXUCwWBCV5Sz_p6NBL4CYb6QkyBCp1p4CRyPouWdW6rxgy-MKt-KYY04jPEwwNFU6uGwS7TD6z698rbVfMumjyyrOtMNvzQDsb3MwaBO5W7pnuiWW3A-h-Czp_KEL39k9CvRZmq-fCKY2UEwdOgwHZBVybPVuVSNEJaFyhJ3zZRK4buS_1LriA6D8G7pp7uEwl",
  },
  {
    id: "portefeuille-cuir",
    title: "Portefeuille en cuir",
    location: "Paris 10e",
    dotColor: "#455d80",
    time: "hier",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAVZe46M5x8qXC3h2DOyPoXkYVWeSoWvUI435nRmzIEN1--7pMtaNWlk5Q1VgJPLx5-9u1tGeX6RXZVid3X_lCQXQXvJ4RONcKjQgHs1xyix2HmYk3xP2Q_6HqqILnEqmy7OYiTPFbfsmrEDqLL_A5nESIp-crOQwnTx7lX1jycLQKt2M4SCAdqpKh8mf_5vnYQeena3JPsC1iX82LLXIUKK838cpHi4nelFNdi4dimAk59ayExXFzs",
  },
  {
    id: "iphone-14-pro",
    title: "iPhone 14 Pro Noir",
    location: "Paris 8e",
    dotColor: "#0058bc",
    time: "lun. 14 oct",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDcKlnzfvaN-bmeuUIGJ4gfRF2ko9IvqtgDqtgdYkukq_BDKZFzXLxulEcuYXV1uhmP-PsSG0byBv4dxCPU5alrDsE7J2eVzRGXpQk8MVoRdo-vRhfWbNSFrvVqgViJTsa6T8mQvVRjNkmobZ8V7D9tRwz8IxlkQE6OgEjxpTd4-Urlfx01o0aeIadJDQEYUPyI_WQ4Zian0mW4_5w-pN4eOWdUyZjNnHBhzM11Zka02iKlUM1y2qru",
  },
];

export default function HomeDashboardPage() {
  return (
    <div className="pb-[120px] md:pb-0 md:pt-[100px]">
      {/* TopAppBar (desktop) */}
      <header className="hidden md:flex justify-between items-center w-full px-container-margin py-base max-w-7xl mx-auto fixed top-0 z-50 bg-background/80 backdrop-blur-md">
        <div className="flex items-center gap-sm">
          <div className="px-3 py-1.5 rounded-xl bg-surface-container-lowest shadow-sm">
            <span className="font-headline-sm text-headline-sm text-on-surface">Objely</span>
          </div>
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
            <span className="material-symbols-outlined mb-1">explore</span>
            Activity
          </Link>
          <Link className="text-on-surface-variant font-label-md text-label-md hover:opacity-80 transition-opacity flex flex-col items-center" href="/profile">
            <span className="material-symbols-outlined mb-1">person</span>
            Profile
          </Link>
        </nav>
        <Link href="/profile" className="w-10 h-10 flex items-center justify-center rounded-full surface-card overflow-hidden bg-surface-container-high">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="Profil"
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCZfuwmAGmqsioZXn2vl0S5TeziGs1iRvYxOAMNX1PWzii9KRcgCccoERwU1Dj76e0-cAN4M1_1ws_bjeZmtSxzXtieAa2J7ngwaqInqx_rnuPJJ3W5dj_MCvXoNG0YdF_6oyDqnRm6zIuhi6ii40MgIjkG5rsKX0XWiP40a5Eu8sK6GuUecMT6pJPUQbKbX9MSI_u1c4V0_o8xVv6hlzkKug9iRIUbUXwp-O7ITLOaaSCSmax9QdFC"
          />
        </Link>
      </header>

      <main className="max-w-7xl mx-auto px-container-margin md:px-lg pt-lg md:pt-xl space-y-lg">
        {/* Mobile Top Row: logo badge + avatar */}
        <div className="md:hidden flex justify-between items-center">
          <div className="px-3 py-1.5 rounded-xl bg-surface-container-lowest shadow-sm">
            <span className="font-headline-sm text-headline-sm text-on-surface">Objely</span>
          </div>
          <Link href="/profile" className="relative">
            <div className="w-11 h-11 rounded-full overflow-hidden ring-2 ring-surface-container-lowest shadow-sm bg-surface-container-high">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt="Profil"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCZfuwmAGmqsioZXn2vl0S5TeziGs1iRvYxOAMNX1PWzii9KRcgCccoERwU1Dj76e0-cAN4M1_1ws_bjeZmtSxzXtieAa2J7ngwaqInqx_rnuPJJ3W5dj_MCvXoNG0YdF_6oyDqnRm6zIuhi6ii40MgIjkG5rsKX0XWiP40a5Eu8sK6GuUecMT6pJPUQbKbX9MSI_u1c4V0_o8xVv6hlzkKug9iRIUbUXwp-O7ITLOaaSCSmax9QdFC"
              />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-surface-container-lowest" />
          </Link>
        </div>

        {/* Greeting */}
        <div>
          <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-background mb-1">
            Bonjour 👋
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">Quelque chose à retrouver ?</p>
        </div>

        {/* Recent Activity Ticker */}
        <div className="-mx-container-margin px-container-margin md:mx-0 md:px-0">
          <div className="bg-surface-container-lowest rounded-full shadow-sm overflow-x-auto hide-scrollbar">
            <div className="flex items-center gap-2 whitespace-nowrap px-4 py-2.5">
              {RECENT_ACTIVITY.map((entry, i) => (
                <span key={entry} className="font-label-md text-label-md text-on-surface-variant flex items-center gap-2">
                  {entry}
                  {i < RECENT_ACTIVITY.length - 1 && <span className="text-outline-variant">•</span>}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Primary Action Cards */}
        <section className="flex flex-col gap-md md:grid md:grid-cols-2 md:gap-lg md:pt-2">
          <Link
            href="/report-lost"
            className="w-full bg-gradient-to-br from-primary to-primary-container text-white p-lg flex flex-col justify-center gap-1.5 shadow-xl min-h-[190px] rounded-[32px] transition-transform hover:scale-[0.98] active:scale-[0.96]"
          >
            <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center mb-1">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>search</span>
            </div>
            <h2 className="font-headline-lg-mobile text-headline-lg-mobile">J&apos;ai perdu un objet</h2>
            <p className="font-body-md text-body-md text-white/80">Déclarez un objet disparu</p>
          </Link>

          <Link
            href="/report-lost"
            className="w-full bg-gradient-to-br from-[#7c6ff0] to-secondary-container text-white p-lg flex flex-col justify-center gap-1.5 shadow-xl min-h-[190px] rounded-[32px] transition-transform hover:scale-[0.98] active:scale-[0.96]"
          >
            <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center mb-1">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>front_hand</span>
            </div>
            <h2 className="font-headline-lg-mobile text-headline-lg-mobile">J&apos;ai trouvé un objet</h2>
            <p className="font-body-md text-body-md text-white/80">Aidez à restituer</p>
          </Link>
        </section>

        {/* Recent Finds */}
        <section className="space-y-md pt-2">
          <div className="flex justify-between items-end">
            <h3 className="font-headline-sm text-headline-sm text-on-background">Objets récemment trouvés près de vous</h3>
            <Link className="font-label-md text-label-md text-primary hover:underline" href="/search">Voir tout</Link>
          </div>
          <div className="flex overflow-x-auto md:grid md:grid-cols-3 gap-md pb-md hide-scrollbar -mx-container-margin px-container-margin md:mx-0 md:px-0">
            {RECENT_ITEMS.map((item) => (
              <Link key={item.id} href="/matching" className="group cursor-pointer flex flex-col min-w-[200px] max-w-[200px] md:min-w-0 md:max-w-none shrink-0">
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.dotColor }} />
                  <span className="font-label-md text-label-md text-on-surface-variant">{item.location}</span>
                </div>
                <div className="relative h-32 rounded-2xl overflow-hidden bg-surface-container-high mb-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    src={item.image}
                  />
                </div>
                <h4 className="font-headline-sm text-headline-sm text-on-background line-clamp-1 mb-0.5">{item.title}</h4>
                <p className="font-body-md text-body-md text-on-surface-variant">Trouvé {item.time}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <BottomNav active="home" />
    </div>
  );
}
