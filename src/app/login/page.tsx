"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { setAuthenticated } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const canSubmit = identifier.trim().length > 0 && password.length > 0;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setAuthenticated();
    router.push("/home");
  };

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col">
      <div
        className="w-full max-w-md mx-auto px-container-margin pb-16 flex flex-col grow"
        style={{ paddingTop: "calc(1rem + env(safe-area-inset-top))" }}
      >
        <Link
          href="/home"
          aria-label="Retour"
          className="-ml-2 w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high/60 transition-colors text-on-surface mb-lg"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>

        <div className="flex flex-col items-center mb-lg">
          <div className="flex items-center gap-2 mb-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo/objely-mark.png" alt="" className="w-9 h-9" />
            <span className="font-headline-sm text-headline-sm font-bold text-on-surface">Objely</span>
          </div>
          <div className="flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1.5 rounded-full">
            <span className="material-symbols-outlined text-[16px]">lock</span>
            <span className="font-label-md text-label-md">Vos données sont protégées</span>
          </div>
        </div>

        <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-2">Connectez-vous à Objely</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mb-xl">
          Retrouvez vos objets et gérez vos déclarations en toute simplicité.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-lg">
          <div>
            <label htmlFor="identifier" className="block font-body-md text-body-md font-semibold text-on-surface mb-2">
              E-mail ou numéro de téléphone
            </label>
            <input
              id="identifier"
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Votre e-mail ou numéro de téléphone"
              autoComplete="username"
              className="w-full px-4 py-4 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest font-body-lg text-body-lg text-on-surface soft-shadow focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          <div>
            <label htmlFor="password" className="block font-body-md text-body-md font-semibold text-on-surface mb-2">
              Mot de passe
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Votre mot de passe"
                autoComplete="current-password"
                className="w-full pr-12 px-4 py-4 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest font-body-lg text-body-lg text-on-surface soft-shadow focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
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
              <button type="button" className="font-body-md text-body-md text-[14px] font-semibold text-primary">
                Mot de passe oublié ?
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className="btn-gradient w-full py-4 rounded-2xl bg-primary text-on-primary font-headline-sm text-headline-sm shadow-[0px_10px_30px_rgba(0,88,188,0.25)] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Se connecter
          </button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="h-px flex-1 bg-outline-variant/50" />
          <span className="font-body-md text-[13px] text-on-surface-variant whitespace-nowrap">ou</span>
          <div className="h-px flex-1 bg-outline-variant/50" />
        </div>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest font-headline-sm text-headline-sm text-on-surface hover:bg-surface-container-low transition-colors"
          >
            <GoogleIcon className="w-5 h-5" />
            Continuer avec Google
          </button>
          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-black text-white font-headline-sm text-headline-sm hover:opacity-90 transition-opacity"
          >
            <AppleIcon className="w-5 h-5" />
            Continuer avec Apple
          </button>
        </div>

        <p className="font-body-md text-body-md text-on-surface-variant text-center mt-6">
          Vous n&apos;avez pas encore de compte ?{" "}
          <Link href="/register" className="text-primary font-semibold">
            Créer un compte
          </Link>
        </p>

        <p className="font-body-md text-[12px] text-on-surface-variant text-center mt-8 leading-relaxed">
          En continuant, vous acceptez les <span className="text-primary font-medium">Conditions d&apos;utilisation</span> et la{" "}
          <span className="text-primary font-medium">Politique de confidentialité</span> d&apos;Objely.
        </p>
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
