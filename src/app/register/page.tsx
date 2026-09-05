"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { setAuthenticated } from "@/lib/auth";

const COUNTRIES = [
  { code: "FR", dial: "+33", flag: "🇫🇷", name: "France" },
  { code: "CI", dial: "+225", flag: "🇨🇮", name: "Côte d'Ivoire" },
  { code: "SN", dial: "+221", flag: "🇸🇳", name: "Sénégal" },
  { code: "ML", dial: "+223", flag: "🇲🇱", name: "Mali" },
  { code: "CM", dial: "+237", flag: "🇨🇲", name: "Cameroun" },
  { code: "BE", dial: "+32", flag: "🇧🇪", name: "Belgique" },
  { code: "CH", dial: "+41", flag: "🇨🇭", name: "Suisse" },
  { code: "CA", dial: "+1", flag: "🇨🇦", name: "Canada" },
  { code: "US", dial: "+1", flag: "🇺🇸", name: "États-Unis" },
  { code: "GB", dial: "+44", flag: "🇬🇧", name: "Royaume-Uni" },
  { code: "DE", dial: "+49", flag: "🇩🇪", name: "Allemagne" },
  { code: "ES", dial: "+34", flag: "🇪🇸", name: "Espagne" },
  { code: "MA", dial: "+212", flag: "🇲🇦", name: "Maroc" },
  { code: "DZ", dial: "+213", flag: "🇩🇿", name: "Algérie" },
  { code: "TN", dial: "+216", flag: "🇹🇳", name: "Tunisie" },
] as const;

const STRENGTH_LEVELS = [
  { label: "Très faible", className: "bg-error" },
  { label: "Faible", className: "bg-amber-500" },
  { label: "Moyen", className: "bg-blue-500" },
  { label: "Fort", className: "bg-emerald-500" },
] as const;

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState<(typeof COUNTRIES)[number]["code"]>("FR");
  const selectedCountry = COUNTRIES.find((c) => c.code === countryCode) ?? COUNTRIES[0];
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const criteria = useMemo(
    () => ({
      length: password.length >= 8,
      upper: /[A-Z]/.test(password),
      digit: /[0-9]/.test(password),
      symbol: /[^A-Za-z0-9]/.test(password),
    }),
    [password],
  );
  const score = Object.values(criteria).filter(Boolean).length;
  const strength = STRENGTH_LEVELS[Math.max(score - 1, 0)];

  const canSubmit =
    name.trim().length > 0 &&
    email.trim().length > 0 &&
    phone.trim().length > 0 &&
    password.length >= 8 &&
    acceptedTerms;

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
        <div className="flex items-center justify-between mb-lg">
          <Link
            href="/login"
            aria-label="Retour"
            className="-ml-2 w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high/60 transition-colors text-on-surface"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div className="flex items-center gap-1.5 text-on-surface-variant">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span className="font-label-md text-label-md">Inscription sécurisée</span>
          </div>
          <div className="w-10" />
        </div>

        <div className="flex flex-col items-center mb-lg">
          <div className="flex items-center gap-2 mb-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo/objely-mark.png" alt="" className="w-9 h-9" />
            <span className="font-headline-sm text-headline-sm font-bold text-on-surface">Objely</span>
          </div>
          <div className="flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1.5 rounded-full">
            <span className="material-symbols-outlined text-[16px]">lock</span>
            <span className="font-label-md text-label-md">Vos données sont sécurisées et chiffrées</span>
          </div>
        </div>

        <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-2">Créer un compte</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mb-xl">
          Rejoignez Objely pour sécuriser, inventorier et retrouver tous vos objets en un instant.
        </p>

        <div className="flex flex-col gap-3 mb-lg">
          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-black text-white font-headline-sm text-headline-sm hover:opacity-90 transition-opacity"
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

        <div className="flex items-center gap-3 mb-lg">
          <div className="h-px flex-1 bg-outline-variant/50" />
          <span className="font-body-md text-[13px] text-on-surface-variant whitespace-nowrap">
            ou inscrivez-vous avec votre e-mail
          </span>
          <div className="h-px flex-1 bg-outline-variant/50" />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-lg">
          <div>
            <label htmlFor="name" className="block font-label-md text-[11px] text-outline uppercase tracking-wider mb-2">
              Prénom et nom
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex. Alex Dupont"
              autoComplete="name"
              required
              className="w-full bg-surface-container-lowest border border-surface-container-highest rounded-[16px] px-4 py-4 font-body-lg text-body-lg text-on-surface soft-shadow focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          <div>
            <label htmlFor="email" className="block font-label-md text-[11px] text-outline uppercase tracking-wider mb-2">
              Adresse e-mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              autoComplete="email"
              required
              className="w-full bg-surface-container-lowest border border-surface-container-highest rounded-[16px] px-4 py-4 font-body-lg text-body-lg text-on-surface soft-shadow focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block font-label-md text-[11px] text-outline uppercase tracking-wider mb-2">
              Numéro de mobile <span className="normal-case text-outline/70">(pour les alertes d&apos;objets)</span>
            </label>
            <div className="flex gap-2">
              <div className="relative shrink-0">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value as (typeof COUNTRIES)[number]["code"])}
                  aria-label="Pays"
                  className="h-full w-[64px] appearance-none bg-none bg-surface-container-lowest border border-surface-container-highest rounded-[16px] pl-3 pr-6 py-4 font-body-lg text-body-lg text-on-surface soft-shadow focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.name}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-1 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px] pointer-events-none">
                  expand_more
                </span>
              </div>
              <div className="flex-1 min-w-0 flex items-center gap-2 bg-surface-container-lowest border border-surface-container-highest rounded-[16px] px-4 py-4 soft-shadow focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                <span className="font-body-lg text-body-lg text-on-surface-variant shrink-0">{selectedCountry.dial}</span>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="6 12 34 56 78"
                  autoComplete="tel"
                  required
                  className="flex-1 min-w-0 bg-transparent border-0 font-body-lg text-body-lg text-on-surface focus:outline-none focus:ring-0 p-0"
                />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="address" className="block font-label-md text-[11px] text-outline uppercase tracking-wider mb-2">
              Adresse (optionnel)
            </label>
            <input
              id="address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Votre adresse"
              autoComplete="street-address"
              className="w-full bg-surface-container-lowest border border-surface-container-highest rounded-[16px] px-4 py-4 font-body-lg text-body-lg text-on-surface soft-shadow focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          <div>
            <label htmlFor="password" className="block font-label-md text-[11px] text-outline uppercase tracking-wider mb-2">
              Mot de passe
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Créez un mot de passe sécurisé"
                autoComplete="new-password"
                required
                className="w-full bg-surface-container-lowest border border-surface-container-highest rounded-[16px] px-4 py-4 pr-12 font-body-lg text-body-lg text-on-surface soft-shadow focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
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

            {password.length > 0 && (
              <div className="mt-3 bg-surface-container-lowest border border-surface-container-highest rounded-[16px] p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-label-md text-label-md text-on-surface-variant">Sécurité du mot de passe :</span>
                  <span className="font-label-md text-label-md font-semibold text-on-surface">{strength.label}</span>
                </div>
                <div className="flex gap-1.5 mb-3">
                  {STRENGTH_LEVELS.map((level, i) => (
                    <div
                      key={level.label}
                      className={`h-1.5 flex-1 rounded-full transition-colors ${i < score ? strength.className : "bg-surface-container-highest"}`}
                    />
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                  <PasswordCriterion met={criteria.length} label="8+ caractères" />
                  <PasswordCriterion met={criteria.upper} label="1 majuscule" />
                  <PasswordCriterion met={criteria.digit} label="1 chiffre" />
                  <PasswordCriterion met={criteria.symbol} label="1 symbole" />
                </div>
              </div>
            )}
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-0.5 w-5 h-5 rounded-md border-outline-variant text-primary focus:ring-primary/30 shrink-0"
            />
            <span className="font-body-md text-body-md text-on-surface-variant">
              J&apos;accepte les <span className="text-primary font-medium">Conditions générales</span> et la{" "}
              <span className="text-primary font-medium">Politique de confidentialité</span> d&apos;Objely.
            </span>
          </label>

          <button
            type="submit"
            disabled={!canSubmit}
            className="btn-gradient w-full py-4 rounded-2xl bg-primary text-on-primary font-headline-sm text-headline-sm shadow-[0px_10px_30px_rgba(0,88,188,0.25)] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Créer mon compte
          </button>
        </form>

        <p className="font-body-md text-body-md text-on-surface-variant text-center mt-6">
          Vous avez déjà un compte ?{" "}
          <Link href="/login" className="text-primary font-semibold">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}

function PasswordCriterion({ met, label }: { met: boolean; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className={`material-symbols-outlined text-[16px] ${met ? "text-emerald-500" : "text-outline-variant"}`}
        style={{ fontVariationSettings: met ? "'FILL' 1" : "'FILL' 0" }}
      >
        {met ? "check_circle" : "radio_button_unchecked"}
      </span>
      <span className={`font-label-md text-label-md ${met ? "text-on-surface" : "text-on-surface-variant"}`}>{label}</span>
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
