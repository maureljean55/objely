import Link from "next/link";
import HelpNav from "@/components/HelpNav";

export default function HelpCenterPage() {
  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col antialiased">
      <header className="sticky top-0 w-full z-30 bg-surface/80 backdrop-blur-xl shadow-sm flex items-center justify-between px-container-margin h-14">
        <Link href="/profile" aria-label="Retour" className="text-primary hover:opacity-70 transition-opacity active:scale-95 flex items-center justify-center w-10 h-10 -ml-2 rounded-full">
          <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 0" }}>arrow_back_ios</span>
        </Link>
        <h1 className="font-headline-sm text-headline-sm text-on-surface absolute left-1/2 -translate-x-1/2">
          Support
        </h1>
        <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 bg-surface-container-high">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="Agent support"
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDU6JeAdh405-ve2qnbhookkk1hhUDtsY4zNzAR7xn73Ol1GsfA2cn7K-sct9yikuzOSE6AamFKeDlM1_rt0opv-A9xfXTjvvNz5icdY3J4ySOxNQWsMrMzCUzgi4RszxHe0Wnwcq_gkV_eBk_l8H_hpcy6b3WG3nr4_H03NCgqd3m0JerAZn_-saicn65oi7kEQ5rMB59SiiaHNJoJMSPoEjdrFIVYUpli5UqtHH9V_Ns9ZTNkO22j"
          />
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-24 pt-8 w-full max-w-md mx-auto text-center relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary-fixed/40 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="w-24 h-24 rounded-full bg-surface-container-lowest/80 backdrop-blur-md border border-outline-variant/30 flex items-center justify-center mb-8 shadow-[0_8px_24px_rgba(0,88,188,0.12)]">
          <span className="material-symbols-outlined text-[48px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
            waving_hand
          </span>
        </div>
        <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-4">
          Besoin d&apos;aide ? 👋
        </h2>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-[320px] mb-10">
          Notre équipe Objely est là pour vous accompagner.
        </p>
        <Link
          href="/help/chat"
          className="btn-primary-gradient text-on-primary font-headline-sm text-headline-sm py-4 px-8 rounded-full shadow-[0_4px_14px_rgba(0,88,188,0.3)] hover:opacity-90 active:scale-95 transition-all duration-200 flex items-center gap-3"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>chat</span>
          Commencer une conversation
        </Link>
      </main>

      <HelpNav active="messages" />
    </div>
  );
}
