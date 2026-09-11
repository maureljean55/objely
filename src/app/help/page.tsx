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
        <h1 className="font-headline-sm text-headline-sm font-extrabold tracking-tight text-on-surface absolute left-1/2 -translate-x-1/2">
          Support
        </h1>
        <div
          className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-white shadow-sm"
          style={{ background: "linear-gradient(135deg, #0058bc, #5952af)" }}
        >
          <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>support_agent</span>
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
        {/* Historique */}
        <section className="bg-surface-container-lowest rounded-[28px] soft-shadow overflow-hidden">
          <Link href="/help/history" className="flex items-center justify-between px-lg py-5 hover:bg-black/[0.02] transition-colors">
            <span className="font-headline-md text-headline-md text-on-surface font-bold">Historique</span>
            <span
              className="w-9 h-9 rounded-full flex items-center justify-center text-white shrink-0"
              style={{ background: "linear-gradient(135deg, #0058bc, #5952af)" }}
            >
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>history</span>
            </span>
          </Link>
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
          <span
            className="w-9 h-9 rounded-full flex items-center justify-center text-white shrink-0 shadow-sm"
            style={{ background: "linear-gradient(135deg, #0058bc, #5952af)" }}
          >
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
          </span>
        </Link>

        <FaqAccordion items={faqItems ?? []} />
      </main>
    </div>
  );
}
