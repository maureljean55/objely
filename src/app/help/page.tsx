import Link from "next/link";
import FaqAccordion from "@/components/FaqAccordion";
import { listFaqItems } from "@/lib/supabase/faq";

export default async function HelpCenterPage() {
  const { data: faqItems } = await listFaqItems();

  return (
    <div className="bg-gradient-to-b from-surface-container to-background text-on-background min-h-screen antialiased pb-12">
      <header className="sticky top-0 z-30 w-full bg-surface/80 backdrop-blur-xl shadow-sm flex items-center justify-between px-container-margin min-h-14 pt-[env(safe-area-inset-top)]">
        <Link href="/profile" aria-label="Retour" className="text-primary hover:opacity-70 transition-opacity active:scale-95 flex items-center justify-center w-10 h-10 -ml-2 rounded-full">
          <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 0" }}>arrow_back_ios</span>
        </Link>
        <h1 className="font-headline-sm text-headline-sm text-on-surface absolute left-1/2 -translate-x-1/2">
          Support
        </h1>
        <div className="w-8 h-8 rounded-full shrink-0 bg-primary-fixed flex items-center justify-center text-primary">
          <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>support_agent</span>
        </div>
      </header>

      {/* Hero */}
      <section className="flex flex-col items-center text-center px-6 pt-10 pb-8 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 bg-primary-fixed/40 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="w-20 h-20 rounded-full bg-surface-container-lowest/80 backdrop-blur-md border border-outline-variant/30 flex items-center justify-center mb-5 shadow-[0_8px_24px_rgba(0,88,188,0.12)]">
          <span className="material-symbols-outlined text-[40px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
            waving_hand
          </span>
        </div>
        <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-2">
          Besoin d&apos;aide ? 👋
        </h2>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-[320px]">
          Notre équipe Objely est là pour vous accompagner.
        </p>
      </section>

      <main className="max-w-2xl mx-auto px-container-margin flex flex-col gap-lg">
        {/* Historique / Aide */}
        <section className="bg-surface-container-lowest rounded-[28px] soft-shadow overflow-hidden">
          <Link href="/help/history" className="flex items-center justify-between px-lg py-5 border-b border-surface-variant/50 hover:bg-black/[0.02] transition-colors">
            <span className="font-headline-md text-headline-md text-on-surface font-bold">Historique</span>
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>history</span>
          </Link>
          <a href="#faq" className="flex items-center justify-between px-lg py-5 hover:bg-black/[0.02] transition-colors">
            <span className="font-headline-md text-headline-md text-on-surface font-bold">Aide</span>
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>help</span>
          </a>
        </section>

        {/* Start a conversation */}
        <Link
          href="/help/chat"
          className="bg-surface-container-lowest rounded-[28px] soft-shadow px-lg py-5 flex items-center justify-between gap-md hover:bg-black/[0.02] transition-colors"
        >
          <div>
            <h2 className="font-headline-md text-headline-md text-on-surface font-bold mb-1">Envoyez-nous un message</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">Nous répondons généralement en quelques minutes</p>
          </div>
          <span className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
          </span>
        </Link>

        <FaqAccordion items={faqItems ?? []} />
      </main>
    </div>
  );
}
