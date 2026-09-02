"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const ACCENT = "#3A5CF9";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const canSubmit = email.trim().length > 0 && password.length > 0;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    router.push("/home");
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-background overflow-hidden">
      <div
        className="absolute inset-x-0 top-0 h-[480px] -z-10 rounded-b-[100%]"
        style={{ background: "radial-gradient(circle at 50% 0%, #cfe0fb 0%, rgb(var(--color-background)) 72%)" }}
      />

      <Link
        href="/home"
        aria-label="Fermer"
        className="absolute top-5 right-5 z-10 w-10 h-10 flex items-center justify-center rounded-full hover:bg-on-surface/5 transition-colors"
      >
        <span className="material-symbols-outlined text-on-surface">close</span>
      </Link>

      <main className="grow w-full max-w-md mx-auto px-container-margin pt-20 pb-16 flex flex-col">
        <h1 className="font-headline-lg-mobile font-bold text-[38px] leading-[1.12] tracking-[-0.01em] text-on-surface text-center mb-3">
          Content de
          <br />
          vous revoir !
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant text-center mb-6">
          Connectez-vous pour retrouver ce qui compte.
        </p>

        <div className="relative w-56 mx-auto mb-8">
          <CloudShape className="absolute -left-10 top-6 w-14 opacity-80 -z-10" />
          <CloudShape className="absolute -right-8 top-0 w-20 opacity-70 -z-10" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/illustrations/login-mascot.png"
            alt=""
            className="w-full select-none pointer-events-none"
            draggable={false}
          />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-lg">
          <div>
            <label htmlFor="email" className="block font-body-md text-body-md font-semibold text-on-surface mb-2">
              Adresse e-mail
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
                mail
              </span>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                autoComplete="email"
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest font-body-lg text-body-lg text-on-surface soft-shadow focus:outline-none focus:ring-2 focus:ring-[#3A5CF9]/20 focus:border-[#3A5CF9] transition-all"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block font-body-md text-body-md font-semibold text-on-surface mb-2">
              Mot de passe
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
                lock
              </span>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Votre mot de passe"
                autoComplete="current-password"
                className="w-full pl-12 pr-12 py-4 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest font-body-lg text-body-lg text-on-surface soft-shadow focus:outline-none focus:ring-2 focus:ring-[#3A5CF9]/20 focus:border-[#3A5CF9] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
            <div className="flex justify-end mt-2">
              <button type="button" className="font-body-md text-body-md text-[14px] font-semibold" style={{ color: ACCENT }}>
                Mot de passe oublié ?
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className="btn-gradient w-full py-4 rounded-2xl text-white font-headline-sm text-headline-sm shadow-[0px_10px_30px_rgba(58,92,249,0.3)] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: ACCENT }}
          >
            Se connecter
          </button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="h-px flex-1 bg-outline-variant/50" />
          <span className="font-body-md text-[13px] text-on-surface-variant whitespace-nowrap">ou continuer avec</span>
          <div className="h-px flex-1 bg-outline-variant/50" />
        </div>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest font-headline-sm text-headline-sm text-on-surface hover:bg-surface-container-low transition-colors"
          >
            <AppleIcon className="w-5 h-5" />
            Continuer avec Apple
          </button>
          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest font-headline-sm text-headline-sm text-on-surface hover:bg-surface-container-low transition-colors"
          >
            <GoogleIcon className="w-5 h-5" />
            Continuer avec Google
          </button>
        </div>

        <p className="font-body-md text-body-md text-on-surface-variant text-center mt-6">
          Pas encore de compte ?{" "}
          <Link href="/register" className="font-semibold" style={{ color: ACCENT }}>
            Créer un compte
          </Link>
        </p>

        <p className="font-body-md text-[12px] text-outline text-center mt-8">Perdu. Trouvé. Retrouvé.</p>
      </main>
    </div>
  );
}

function CloudShape({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <ellipse cx="20" cy="24" rx="16" ry="12" fill="#B9D3FB" />
      <ellipse cx="36" cy="18" rx="14" ry="11" fill="#B9D3FB" />
      <ellipse cx="48" cy="26" rx="12" ry="9" fill="#B9D3FB" />
    </svg>
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
