import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import NotificationTicker from "@/components/NotificationTicker";

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
    <div className="pt-[calc(172px+env(safe-area-inset-top))] pb-[120px] md:pt-[calc(100px+env(safe-area-inset-top))] md:pb-0">
      {/* TopAppBar (mobile) — fixed, stays put while the body scrolls */}
      <header
        className="md:hidden fixed top-0 inset-x-0 z-40 flex flex-col gap-md px-container-margin pb-md bg-background/90 backdrop-blur-md"
        style={{ paddingTop: "calc(0.75rem + env(safe-area-inset-top))" }}
      >
        <div className="flex justify-between items-center">
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
          <div className="flex items-center gap-2">
            <Link
              href="/notifications"
              aria-label="Notifications"
              className="relative w-11 h-11 rounded-full bg-surface-container-lowest shadow-sm flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-[22px]">notifications</span>
              <span className="absolute top-2.5 right-3 w-2 h-2 rounded-full bg-error ring-2 ring-surface-container-lowest" />
            </Link>
            <Link
              href="/qr"
              aria-label="Scanner un QR code"
              className="w-11 h-11 rounded-full bg-surface-container-lowest shadow-sm flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-[22px]">qr_code_scanner</span>
            </Link>
          </div>
        </div>

        <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-background">
          Quelque chose à retrouver ?
        </h1>

        <NotificationTicker />
      </header>

      {/* TopAppBar (desktop) */}
      <header
        className="hidden md:flex justify-between items-center w-full px-container-margin pb-base max-w-7xl mx-auto fixed top-0 z-50 bg-background/80 backdrop-blur-md"
        style={{ paddingTop: "calc(0.5rem + env(safe-area-inset-top))" }}
      >
        <div className="flex items-center gap-sm">
          <div className="px-3 py-1.5 rounded-xl bg-surface-container-lowest shadow-sm">
            <span className="font-headline-sm text-headline-sm text-on-surface">Objely</span>
          </div>
        </div>
        <nav className="flex gap-gutter">
          <Link className="text-primary font-label-md text-label-md hover:opacity-80 transition-opacity flex flex-col items-center" href="/home">
            <span className="material-symbols-outlined mb-1" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
            Accueil
          </Link>
          <Link className="text-on-surface-variant font-label-md text-label-md hover:opacity-80 transition-opacity flex flex-col items-center" href="/search">
            <span className="material-symbols-outlined mb-1">search</span>
            Recherche
          </Link>
          <Link className="text-on-surface-variant font-label-md text-label-md hover:opacity-80 transition-opacity flex flex-col items-center" href="/activity">
            <span className="material-symbols-outlined mb-1">explore</span>
            Activité
          </Link>
          <Link className="text-on-surface-variant font-label-md text-label-md hover:opacity-80 transition-opacity flex flex-col items-center" href="/profile">
            <span className="material-symbols-outlined mb-1">person</span>
            Profil
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
        {/* Greeting (desktop only — mobile shows this pinned in the fixed header above) */}
        <div className="hidden md:block">
          <h1 className="font-headline-lg text-headline-lg text-on-background">Quelque chose à retrouver ?</h1>
        </div>

        {/* Recent Activity Notification (desktop only) */}
        <div className="hidden md:block max-w-sm">
          <NotificationTicker />
        </div>

        {/* Primary Action Cards */}
        <section className="flex flex-col gap-lg md:grid md:grid-cols-2 md:gap-lg md:pt-2">
          <Link
            href="/report-lost"
            className="w-[88%] self-start md:w-auto md:self-auto bg-gradient-to-br from-primary to-primary-container text-white p-lg flex flex-col justify-center gap-1.5 shadow-xl min-h-[190px] rounded-tl-[56px] rounded-tr-[110px] rounded-br-[40px] rounded-bl-[100px] md:rounded-[28px] transition-transform hover:scale-[0.98] active:scale-[0.96]"
          >
            <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center mb-1">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>search</span>
            </div>
            <h2 className="font-headline-lg-mobile text-headline-lg-mobile">J&apos;ai perdu un objet</h2>
            <p className="font-body-md text-body-md text-white/80">Déclarez un objet disparu</p>
          </Link>

          <Link
            href="/report-found"
            className="w-[80%] self-end md:w-auto md:self-auto bg-gradient-to-br from-[#7c6ff0] to-secondary-container text-white p-lg flex flex-col justify-center gap-1.5 shadow-xl min-h-[190px] rounded-tl-[110px] rounded-tr-[56px] rounded-br-[100px] rounded-bl-[40px] md:rounded-[28px] transition-transform hover:scale-[0.98] active:scale-[0.96]"
          >
            <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center mb-1">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>front_hand</span>
            </div>
            <h2 className="font-headline-lg-mobile text-headline-lg-mobile">J&apos;ai trouvé un objet</h2>
            <p className="font-body-md text-body-md text-white/80">Aidez à restituer</p>
          </Link>
        </section>

        {/* Recent Finds — community notifications, not links to a specific item */}
        <section className="space-y-md pt-2">
          <h3 className="font-headline-sm text-headline-sm text-on-background">Objets récemment trouvés près de vous</h3>
          <div className="flex overflow-x-auto md:grid md:grid-cols-3 gap-md pb-md hide-scrollbar -mx-container-margin px-container-margin md:mx-0 md:px-0">
            {RECENT_ITEMS.map((item) => (
              <div key={item.id} className="flex flex-col min-w-[200px] max-w-[200px] md:min-w-0 md:max-w-none shrink-0">
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.dotColor }} />
                  <span className="font-label-md text-label-md text-on-surface-variant">{item.location}</span>
                </div>
                <div className="relative h-32 rounded-2xl overflow-hidden bg-surface-container-high mb-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img alt={item.title} className="w-full h-full object-cover" src={item.image} />
                </div>
                <h4 className="font-headline-sm text-headline-sm text-on-background line-clamp-1 mb-0.5">{item.title}</h4>
                <p className="font-body-md text-body-md text-on-surface-variant">Trouvé {item.time}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <BottomNav active="home" />
    </div>
  );
}
