import Link from "next/link";
import BottomNav from "@/components/BottomNav";

const FILTERS = ["Tous", "Téléphones", "Sacs", "Clés", "Portefeuilles", "Ordinateurs", "Autres"];

const RESULTS = [
  {
    id: "cles-voiture",
    title: "Clés de voiture",
    status: "lost" as const,
    time: "Il y a 2h",
    location: "Paris 15e",
    distance: "à 500m",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD12B1FPVpUN5NIKUAnRKs5zpF18Vs7MYWFKe5RJJU61StGE4BMYN6mFim0UfZNg_b2BcOfvsFJuCTHHVPjQ-eBDgsWsPYnrwuyVh8tcST2eWbs5w_Bjxu5uA3dquqlFMhbPc-nMofuIJ2EgoDgXkhHY6dma8zwP1ajRjCQg_F7yu63w8SaReqUwpu_5AAnYMvKSyVVmD8grwvtr6gVqXNECBTSMRAK2fMRWjCFzQBVnFOPMqrPRVTr",
  },
  {
    id: "sac-cuir",
    title: "Sac à main en cuir",
    status: "found" as const,
    time: "Hier",
    location: "Gare de Lyon, Paris",
    distance: "à 2.3km",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCzRy31A-tA9ur8LWAQyHrs0D3843_S-zmZtA3E0AVZtv8xbjuWXAMCyu23c-VJGZTpWL-O677uSY5fq4VIFWYXqJiSMB_4IqttGjSembhVoA2vv27RBXEO4_F6VbAQmOVKhElBSGFSvyDbUQCALbJiNRXDjhofuvdN215Sl3KOoleEVgcoPk-YlHJn6_U6YkX5DQ5xjzrLNuxpmEn5Q17b6Dla7wlRL_kDAftywtZln2AIc885pAN0",
  },
  {
    id: "iphone-14",
    title: "iPhone 14 Pro",
    status: "lost" as const,
    time: "12 Oct",
    location: "Parc Monceau, Paris 8e",
    distance: "à 4km",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDhOSzw46jyObmdDIEMPe34PXcctOSk0Xn68_M2_30rLQlDPuTowtmeMb0FAHimvC6QQJT0w7efR4OU_x_uZFtbW04sqehneoQsBdUHlr2pSXfuDqRsWC6NoF8v-tRbU9ckSAGS6DaUnTkU8G0y_PkE_UTmsUzipzZDsCP08Y9elsOYWgGtBDdnd1m47remkrXzdebwp1beROMU1Y7Qnz-p-SHekgDqhmlO9gz3RdbdMLfUHQ-pUlJe",
  },
  {
    id: "portefeuille-noir",
    title: "Portefeuille Noir",
    status: "found" as const,
    time: "10 Oct",
    location: "Métro Châtelet",
    distance: "à 1.2km",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBTTXu6kXXl-f6dnnR3XBeqCCgnd9PM4Y4lb2A2Ez4fIBWxPJ9tv7BRQivwkQ2K3KUMjOIOKJdfPIwa-4YcceblYEXq_Oo_Fq3QgCycYynjiOFB8IjjdWdf9EfN8YUWIU86hLwueYqDiShBG8nagKckgKzCJDZTWgCIIdpZIA0EjFA40RsRcbgxWupE30b49QwE8ssMfkbttc2nepVEv2n5ZcBNxAI7lOuKZBDUioKQ8RdijS4D2iV3",
  },
];

export default function SearchFiltersPage() {
  return (
    <div className="bg-[#F2F2F7] text-on-background font-body-md min-h-screen pb-24 md:pb-0 pt-20">
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md shadow-sm">
        <div className="flex items-center justify-between px-container-margin py-sm w-full max-w-full mx-auto md:max-w-[1140px]">
          <Link href="/" className="text-on-surface-variant hover:opacity-80 transition-opacity active:scale-95 hidden md:flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">arrow_back</span>
          </Link>
          <h1 className="font-display text-headline-sm font-bold text-on-surface text-center flex-1">Rechercher un objet</h1>
          <button className="text-on-surface-variant hover:opacity-80 transition-opacity active:scale-95 flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">info</span>
          </button>
        </div>
      </header>

      <main className="max-w-[1140px] mx-auto px-container-margin">
        <section className="mt-lg mb-lg">
          <div className="flex flex-col md:flex-row gap-sm items-center w-full">
            <div className="relative w-full flex-1">
              <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-outline">search</span>
              <input
                className="w-full bg-surface text-on-surface placeholder:text-outline rounded border-none focus:ring-1 focus:ring-primary pl-[44px] pr-sm h-[56px] font-body-md transition-all shadow-sm"
                placeholder="Que recherchez-vous ?"
                type="text"
              />
            </div>
            <button className="flex items-center justify-center gap-2 bg-surface text-primary border border-primary rounded px-md h-[56px] font-headline-sm hover:opacity-80 transition-opacity whitespace-nowrap w-full md:w-auto shadow-sm">
              <span className="material-symbols-outlined">tune</span>
              Filtres
            </button>
          </div>
          <div className="flex gap-sm overflow-x-auto hide-scrollbar mt-sm py-xs w-full">
            {FILTERS.map((filter, i) => (
              <button
                key={filter}
                className={
                  i === 0
                    ? "bg-[#A29BFE]/15 text-[#A29BFE] rounded-full px-4 py-2 font-label-md whitespace-nowrap border border-transparent"
                    : "bg-surface text-on-surface-variant rounded-full px-4 py-2 font-label-md whitespace-nowrap border border-outline-variant hover:bg-surface-variant transition-colors"
                }
              >
                {filter}
              </button>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-md mb-xl">
          {RESULTS.map((item) => (
            <Link
              key={item.id}
              href="/matching"
              className="bg-surface rounded-lg shadow-soft-bloom overflow-hidden relative group border border-black/5 hover:scale-[1.02] transition-transform duration-300"
            >
              <div className="h-48 w-full relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img alt={item.title} className="w-full h-full object-cover rounded-t-lg" src={item.image} />
                {item.status === "lost" ? (
                  <div className="absolute top-sm right-sm bg-error-container text-on-error-container px-3 py-1 rounded-full font-label-md flex items-center gap-1 shadow-sm backdrop-blur-md bg-opacity-90">
                    <span className="material-symbols-outlined text-[14px]">warning</span>
                    Perdu
                  </div>
                ) : (
                  <div className="absolute top-sm right-sm bg-[#e8f5e9] text-[#2e7d32] px-3 py-1 rounded-full font-label-md flex items-center gap-1 shadow-sm backdrop-blur-md bg-opacity-90">
                    <span className="material-symbols-outlined text-[14px]">check_circle</span>
                    Trouvé
                  </div>
                )}
              </div>
              <div className="p-md flex flex-col gap-sm bg-surface">
                <div className="flex justify-between items-start">
                  <h2 className="font-headline-sm text-on-surface font-semibold line-clamp-1">{item.title}</h2>
                  <span className="text-outline text-[12px] font-label-md whitespace-nowrap">{item.time}</span>
                </div>
                <div className="flex flex-col gap-1 text-on-surface-variant font-label-md">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">location_on</span>
                    <span>{item.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-primary">
                    <span className="material-symbols-outlined text-[16px]">near_me</span>
                    <span>{item.distance}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </section>
      </main>

      <BottomNav active="search" />
    </div>
  );
}
