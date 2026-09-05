"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUpWithPassword } from "@/lib/auth";

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

const HEADER_HEIGHT = "calc(172px + env(safe-area-inset-top))";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationSent, setConfirmationSent] = useState(false);

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
    acceptedTerms &&
    !isSubmitting;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setIsSubmitting(true);
    setError(null);

    const { data, error: signUpError } = await signUpWithPassword(email.trim(), password, {
      full_name: name.trim(),
      phone: `${selectedCountry.dial} ${phone.trim()}`,
      address: address.trim() || null,
    });

    if (signUpError) {
      setError(
        signUpError.message === "User already registered"
          ? "Un compte existe déjà avec cet e-mail."
          : signUpError.message,
      );
      setIsSubmitting(false);
      return;
    }

    if (!data.session) {
      // Email confirmation is required before a session is created.
      setConfirmationSent(true);
      setIsSubmitting(false);
      return;
    }

    router.push("/home");
    router.refresh();
  };

  if (confirmationSent) {
    return (
      <div className="min-h-[100dvh] bg-background flex flex-col items-center justify-center px-container-margin text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-[32px]">mark_email_read</span>
        </div>
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-2">Vérifiez votre e-mail</h1>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-xs mb-6">
          Nous avons envoyé un lien de confirmation à <span className="font-semibold text-on-surface">{email}</span>.
          Cliquez dessus pour activer votre compte.
        </p>
        <Link href="/login" className="text-primary font-semibold">
          Retour à la connexion
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col">
      <div
        className="fixed top-0 inset-x-0 z-20 bg-background/95 backdrop-blur-md border-b border-outline-variant/20"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="w-full max-w-md mx-auto px-container-margin pt-4 pb-4 flex flex-col">
          <div className="flex items-center justify-between">
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

          <div className="flex flex-col items-center mt-2">
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
        </div>
      </div>

      <main
        className="w-full max-w-md mx-auto px-container-margin pb-16 flex flex-col grow"
        style={{ paddingTop: HEADER_HEIGHT }}
      >
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-2 mt-lg">Créer un compte</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mb-xl">
          Rejoignez Objely pour sécuriser, inventorier et retrouver tous vos objets en un instant.
        </p>

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

          {error && (
            <p className="font-body-md text-body-md text-error bg-error-container/40 rounded-xl px-4 py-3">{error}</p>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className="btn-gradient w-full py-4 rounded-2xl bg-primary text-on-primary font-headline-sm text-headline-sm shadow-[0px_10px_30px_rgba(0,88,188,0.25)] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Création…" : "Créer mon compte"}
          </button>
        </form>

        <p className="font-body-md text-body-md text-on-surface-variant text-center mt-6">
          Vous avez déjà un compte ?{" "}
          <Link href="/login" className="text-primary font-semibold">
            Se connecter
          </Link>
        </p>
      </main>
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
