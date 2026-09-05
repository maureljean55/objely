"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { setAuthenticated } from "@/lib/auth";

const HEADER_HEIGHT = "calc(112px + env(safe-area-inset-top))";
const FOOTER_HEIGHT = "calc(64px + env(safe-area-inset-bottom))";

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

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState<(typeof COUNTRIES)[number]["code"]>("FR");
  const selectedCountry = COUNTRIES.find((c) => c.code === countryCode) ?? COUNTRIES[0];
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const canSubmit = name.trim().length > 0 && email.trim().length > 0 && phone.trim().length > 0 && passwordsMatch;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setAuthenticated();
    router.push("/home");
  };

  return (
    <div className="font-body-md text-on-surface antialiased min-h-[100dvh] flex flex-col bg-background">
      <div
        className="fixed top-0 inset-x-0 z-20 bg-background/95 backdrop-blur-md border-b border-outline-variant/20"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="w-full max-w-md mx-auto px-container-margin py-lg">
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-2">Créer un compte</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Rejoignez Objely pour déclarer et retrouver vos objets.
          </p>
        </div>
      </div>

      <main
        className="grow w-full max-w-md mx-auto px-container-margin flex flex-col"
        style={{ paddingTop: HEADER_HEIGHT, paddingBottom: FOOTER_HEIGHT }}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-lg py-lg">
          <div>
            <label htmlFor="name" className="block font-label-md text-[11px] text-outline uppercase tracking-wider mb-2">
              Nom complet
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Votre nom"
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
              Numéro de téléphone
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
                placeholder="Votre mot de passe"
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
          </div>

          <div>
            <label htmlFor="confirm-password" className="block font-label-md text-[11px] text-outline uppercase tracking-wider mb-2">
              Confirmer le mot de passe
            </label>
            <input
              id="confirm-password"
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirmez votre mot de passe"
              autoComplete="new-password"
              required
              className="w-full bg-surface-container-lowest border border-surface-container-highest rounded-[16px] px-4 py-4 font-body-lg text-body-lg text-on-surface soft-shadow focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            {confirmPassword.length > 0 && !passwordsMatch && (
              <p className="font-body-md text-[12px] text-error mt-2">Les mots de passe ne correspondent pas.</p>
            )}
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className="btn-gradient w-full py-4 rounded-xl bg-primary text-on-primary font-headline-sm text-headline-sm shadow-[0px_10px_30px_rgba(0,88,188,0.15)] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            Créer un compte
          </button>
        </form>
      </main>

      <div
        className="fixed bottom-0 inset-x-0 z-20 bg-background/90 backdrop-blur-xl border-t border-surface-container-highest"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <p className="w-full max-w-md mx-auto px-container-margin py-4 font-body-md text-body-md text-on-surface-variant text-center">
          Déjà un compte ?{" "}
          <Link href="/login" className="text-primary font-semibold">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
