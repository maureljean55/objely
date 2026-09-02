import Link from "next/link";

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-container-margin relative overflow-hidden">
      <div className="blob-bg" />
      <div className="relative z-10 flex flex-col items-center max-w-sm">
        <div className="w-20 h-20 rounded-full bg-surface-container-high flex items-center justify-center mb-lg">
          <span className="material-symbols-outlined text-[36px] text-on-surface-variant">wifi_off</span>
        </div>
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-2">Pas de connexion</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant mb-xl">
          Cette page n&apos;est pas disponible hors ligne. Vérifiez votre connexion et réessayez.
        </p>
        <Link
          href="/home"
          className="w-full max-w-xs h-14 bg-primary btn-gradient text-on-primary font-headline-sm text-headline-sm rounded-[16px] flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-[0_10px_30px_rgba(0,88,188,0.2)]"
        >
          <span className="material-symbols-outlined">refresh</span>
          Réessayer
        </Link>
      </div>
    </div>
  );
}
