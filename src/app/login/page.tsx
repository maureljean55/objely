import Link from "next/link";

const BUBBLES = [
  {
    id: "wallet",
    src: "/illustrations/splash/wallet.png",
    alt: "Portefeuille",
    gradient: "linear-gradient(145deg, #0058bc 0%, #0070eb 100%)",
    style: { top: "6%", left: "8%" },
  },
  {
    id: "phone",
    src: "/illustrations/splash/phone.png",
    alt: "Téléphone",
    gradient: "linear-gradient(145deg, #5952af 0%, #a19afd 100%)",
    style: { top: "2%", right: "4%" },
  },
  {
    id: "keys",
    src: "/illustrations/splash/keys.png",
    alt: "Clés",
    gradient: "linear-gradient(145deg, #455d80 0%, #5d769a 100%)",
    style: { bottom: "4%", left: "0%" },
  },
  {
    id: "earbuds",
    src: "/illustrations/splash/earbuds.png",
    alt: "Écouteurs",
    gradient: "linear-gradient(145deg, #7c6ff0 0%, #a19afd 100%)",
    style: { bottom: "8%", right: "6%" },
  },
] as const;

export default function LoginWelcomePage() {
  return (
    <div
      className="relative min-h-[100dvh] flex flex-col overflow-hidden"
      style={{ background: "linear-gradient(160deg, #dce6fb 0%, #f2f5ff 55%, #ffffff 100%)" }}
    >
      <div
        className="flex-1 flex flex-col items-center justify-center px-container-margin"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="relative w-[280px] h-[280px] shrink-0">
          <div className="absolute inset-8 rounded-full border-2 border-dashed border-primary/25" />

          {BUBBLES.map((bubble) => (
            <div
              key={bubble.id}
              className="absolute w-16 h-16 rounded-[22px] flex items-center justify-center p-2.5 shadow-[0_10px_24px_rgba(0,31,63,0.18)] ring-4 ring-white"
              style={{ ...bubble.style, background: bubble.gradient }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={bubble.src} alt={bubble.alt} className="max-w-full max-h-full object-contain drop-shadow-md" />
            </div>
          ))}

          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="font-headline-lg text-[36px] font-extrabold tracking-tight text-transparent bg-clip-text"
              style={{ backgroundImage: "linear-gradient(90deg, #0058bc 0%, #5952af 100%)" }}
            >
              Objely
            </span>
          </div>
        </div>

        <div className="text-center mt-10 px-4">
          <h1 className="font-headline-lg-mobile text-[28px] font-extrabold leading-tight text-on-surface">
            Retrouvez ce qui
            <br />
            compte pour vous
          </h1>
        </div>
      </div>

      <div
        className="w-full max-w-md mx-auto px-container-margin flex flex-col gap-3"
        style={{ paddingBottom: "calc(2rem + env(safe-area-inset-bottom))" }}
      >
        <Link
          href="/login/email"
          className="btn-gradient w-full py-4 rounded-full bg-primary text-on-primary text-center font-headline-sm text-headline-sm shadow-[0px_10px_30px_rgba(0,88,188,0.25)] hover:opacity-90 transition-opacity"
        >
          Se connecter
        </Link>
        <Link
          href="/register"
          className="w-full py-4 rounded-full bg-surface-container-lowest text-on-surface text-center font-headline-sm text-headline-sm border border-outline-variant/60 hover:bg-surface-container-low transition-colors"
        >
          Créer un compte
        </Link>

        <div className="flex items-center gap-3 my-1">
          <div className="h-px flex-1 bg-outline-variant/50" />
          <span className="font-label-md text-[11px] text-outline uppercase tracking-wider">ou</span>
          <div className="h-px flex-1 bg-outline-variant/50" />
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            aria-label="Continuer avec Apple"
            className="flex-1 py-4 rounded-full bg-surface-container-lowest border border-outline-variant/60 flex items-center justify-center hover:bg-surface-container-low transition-colors"
          >
            <AppleIcon className="w-5 h-5 text-on-surface" />
          </button>
          <button
            type="button"
            aria-label="Continuer avec Google"
            className="flex-1 py-4 rounded-full bg-surface-container-lowest border border-outline-variant/60 flex items-center justify-center hover:bg-surface-container-low transition-colors"
          >
            <GoogleIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 384 512" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
    </svg>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.9 6.1 29.7 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.6 15.1 18.9 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.9 6.1 29.7 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.6 0 10.7-2.1 14.5-5.6l-6.7-5.7C29.6 34.7 26.9 36 24 36c-5.3 0-9.7-3.4-11.3-8.1l-6.6 5.1C9.6 39.5 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.7 5.7C39.9 37 44 31.5 44 24c0-1.3-.1-2.7-.4-3.5z"
      />
    </svg>
  );
}
