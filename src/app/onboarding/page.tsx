import Link from "next/link";

export default function OnboardingStep1Page() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-between relative overflow-hidden">
      <div className="blob-bg" />
      <main className="w-full max-w-[1140px] px-container-margin md:px-lg flex flex-col grow items-center justify-center relative z-10">
        <div className="w-full max-w-sm aspect-square relative mb-xl animate-float flex items-center justify-center mt-12 md:mt-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="w-full h-full object-contain drop-shadow-[0_20px_40px_rgba(0,31,63,0.15)] rounded-[32px]"
            alt="Illustration d'un smartphone et d'un sac flottant, symbolisant les objets perdus"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBSRXAILmlIdJCUVhKiPOP_DsUv4mGLAL5p2TRwmycMQv9g63tek9rJKdKxnrCbTcC5e-7TS9Bk9EwbHt2LKEVb77ogP6k7mGpBIVzknVZ1CGgPBUspICzARNcC210u4Jhxx9ik_evEJ9uTGhaXLGTDmoxlfirIgMzcQuy5XAcBAy9pjZCDnaTEg132_acrwCubOH6EEWzqM1y-1cRTbxH1Be-SF_23aLfECvtuEXWdrNKf0p1FKNAI"
          />
        </div>
        <div className="text-center max-w-md w-full px-4">
          <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-4">
            Un objet perdu ?
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-xl">
            Pas de panique. Objely utilise une technologie intelligente pour vous aider à retrouver rapidement ce qui compte pour vous.
          </p>
        </div>
      </main>
      <footer className="w-full max-w-[1140px] px-container-margin pb-12 pt-8 flex flex-col items-center gap-6 z-10 relative bg-gradient-to-t from-background via-background to-transparent">
        <div className="flex gap-2">
          <div className="w-8 h-1 rounded-full bg-primary transition-all duration-300" />
          <div className="w-2 h-1 rounded-full bg-surface-container-highest transition-all duration-300" />
          <div className="w-2 h-1 rounded-full bg-surface-container-highest transition-all duration-300" />
        </div>
        <Link
          href="/report-lost"
          className="w-full max-w-sm h-14 bg-primary btn-gradient text-on-primary font-headline-sm text-headline-sm rounded-[16px] flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-[0_10px_30px_rgba(0,88,188,0.2)]"
        >
          Suivant
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>arrow_forward</span>
        </Link>
        <Link href="/home" className="font-label-md text-label-md text-outline hover:text-primary transition-colors py-2 px-4 rounded-full">
          Passer
        </Link>
      </footer>
    </div>
  );
}
