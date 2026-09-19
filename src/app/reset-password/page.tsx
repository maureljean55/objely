"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const STRENGTH_LEVELS = [
  { label: "Très faible", className: "bg-error" },
  { label: "Faible", className: "bg-amber-500" },
  { label: "Moyen", className: "bg-blue-500" },
  { label: "Fort", className: "bg-emerald-500" },
] as const;

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

export default function ResetPasswordPage() {
  const router = useRouter();
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [pendingTokenHash, setPendingTokenHash] = useState<string | null>(null);
  const [isConfirmingLink, setIsConfirmingLink] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    // A recovery link only proves the requester controls the mailbox — for
    // a 2FA-enabled account that must not be enough on its own to change
    // the password, or anyone with just the inbox could strip the second
    // factor's protection entirely. The middleware's own AAL gate can't
    // catch this: the tokens/token_hash below live only in the URL (hash
    // fragment or, for the confirm-click flow, query string before it's
    // exchanged), which never reaches the server, so proxy.ts never sees a
    // session to gate on this request. Checking here, client-side, right
    // after the session is established, is the only point this can
    // actually be enforced on the direct-link path.
    async function admitOrRequireMfa() {
      const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aal && aal.nextLevel === "aal2" && aal.currentLevel !== "aal2") {
        router.replace("/login?next=/reset-password");
        return;
      }
      setHasSession(true);
      setCheckingSession(false);
    }

    // Preferred flow: the Reset Password email template links here with
    // ?token_hash=...&type=recovery — a raw, not-yet-consumed token —
    // instead of Supabase's default {{ .ConfirmationURL }}, which points
    // straight at /auth/v1/verify and burns the single-use token on the
    // very first GET it receives. Mail clients (Gmail chief among them)
    // routinely pre-fetch links in an email to scan them for phishing
    // before a human ever taps anything, which silently burns that kind of
    // link before the real click happens — the user then hits "Lien
    // invalide ou expiré" despite never having used the link themselves.
    // Landing here with the token still unconsumed, and only exchanging it
    // via verifyOtp() from an explicit button press (see handleConfirmLink
    // below), means an automated prefetch — which fetches the URL but
    // doesn't click buttons — can't burn it.
    const searchParams = new URLSearchParams(window.location.search);
    const tokenHash = searchParams.get("token_hash");
    if (tokenHash && searchParams.get("type") === "recovery") {
      setPendingTokenHash(tokenHash);
      setCheckingSession(false);
      return;
    }

    // Fallback: the old hash-fragment flow, for any recovery email already
    // sent before the template above is switched over in the Supabase
    // dashboard. Not click-gated — still vulnerable to the same prefetch
    // issue — but keeps in-flight emails working during the transition.
    const hash = window.location.hash.startsWith("#") ? window.location.hash.slice(1) : window.location.hash;
    const hashParams = new URLSearchParams(hash);
    const accessToken = hashParams.get("access_token");
    const refreshToken = hashParams.get("refresh_token");

    // Clear the hash immediately either way, so the tokens don't linger in
    // the address bar or in browser history.
    if (hash) window.history.replaceState(null, "", window.location.pathname + window.location.search);

    if (hashParams.get("error") || hashParams.get("error_code")) {
      setHasSession(false);
      setCheckingSession(false);
      return;
    }

    if (accessToken && refreshToken) {
      supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken }).then(({ error }) => {
        if (error) {
          setHasSession(false);
          setCheckingSession(false);
          return;
        }
        admitOrRequireMfa();
      });
      return;
    }

    // No hash at all — either a stale bookmark, or a page refresh after the
    // hash above already established a real (cookie-backed) session.
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        setHasSession(false);
        setCheckingSession(false);
        return;
      }
      admitOrRequireMfa();
    });
  }, [router]);

  const handleConfirmLink = async () => {
    if (!pendingTokenHash) return;
    setIsConfirmingLink(true);

    const supabase = createClient();
    const { error: verifyError } = await supabase.auth.verifyOtp({ token_hash: pendingTokenHash, type: "recovery" });
    if (verifyError) {
      setPendingTokenHash(null);
      setHasSession(false);
      setIsConfirmingLink(false);
      return;
    }

    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aal && aal.nextLevel === "aal2" && aal.currentLevel !== "aal2") {
      router.replace("/login?next=/reset-password");
      return;
    }

    setPendingTokenHash(null);
    setHasSession(true);
    setIsConfirmingLink(false);
  };

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
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const canSubmit = password.length >= 8 && passwordsMatch && !isSubmitting;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setIsSubmitting(true);
    setError(null);

    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setIsSubmitting(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setSuccess(true);
  };

  if (checkingSession) {
    return (
      <div className="bg-background min-h-[100dvh] flex items-center justify-center">
        <span className="w-8 h-8 border-4 border-primary-container/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (pendingTokenHash) {
    return (
      <div className="min-h-[100dvh] bg-background flex flex-col items-center justify-center px-container-margin text-center gap-3">
        <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2">
          <span className="material-symbols-outlined text-[32px]">lock_reset</span>
        </div>
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">Confirmer la réinitialisation</h1>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-xs">
          Confirmez que c&apos;est bien vous qui avez demandé à changer de mot de passe.
        </p>
        <button
          type="button"
          onClick={handleConfirmLink}
          disabled={isConfirmingLink}
          className="btn-gradient px-6 py-3 rounded-2xl bg-primary text-on-primary font-headline-sm text-headline-sm shadow-[0px_10px_30px_rgba(0,88,188,0.25)] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        >
          {isConfirmingLink ? "Confirmation…" : "Confirmer et continuer"}
        </button>
      </div>
    );
  }

  if (!hasSession) {
    return (
      <div className="min-h-[100dvh] bg-background flex flex-col items-center justify-center px-container-margin text-center gap-3">
        <div className="w-16 h-16 rounded-full bg-error-container/40 text-error flex items-center justify-center mb-2">
          <span className="material-symbols-outlined text-[32px]">error</span>
        </div>
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">Lien invalide ou expiré</h1>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-xs">
          Ce lien de réinitialisation n&apos;est plus valable. Demandez-en un nouveau.
        </p>
        <Link href="/forgot-password" className="text-primary font-semibold mt-2">
          Réinitialiser mon mot de passe
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-[100dvh] bg-background flex flex-col items-center justify-center px-container-margin text-center gap-3">
        <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2">
          <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
        </div>
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">Mot de passe mis à jour</h1>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-xs">
          Vous pouvez maintenant continuer avec votre nouveau mot de passe.
        </p>
        <button
          type="button"
          onClick={() => {
            router.push("/home");
            router.refresh();
          }}
          className="text-primary font-semibold mt-2"
        >
          Continuer
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col">
      <main className="w-full max-w-md mx-auto px-container-margin pb-16 flex flex-col grow" style={{ paddingTop: "calc(3rem + env(safe-area-inset-top))" }}>
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-2">Choisissez un nouveau mot de passe</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mb-xl">Votre nouveau mot de passe remplacera l&apos;ancien immédiatement.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-lg">
          <div>
            <label htmlFor="password" className="block font-body-md text-body-md font-semibold text-on-surface mb-2">
              Nouveau mot de passe
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Créez un nouveau mot de passe"
                autoComplete="new-password"
                autoFocus
                className="w-full px-4 py-4 pr-12 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest font-body-lg text-body-lg text-on-surface soft-shadow focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant"
              >
                <span className="material-symbols-outlined text-[20px]">{showPassword ? "visibility_off" : "visibility"}</span>
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

          <div>
            <label htmlFor="confirm-password" className="block font-body-md text-body-md font-semibold text-on-surface mb-2">
              Confirmer le mot de passe
            </label>
            <input
              id="confirm-password"
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirmez le nouveau mot de passe"
              autoComplete="new-password"
              className="w-full px-4 py-4 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest font-body-lg text-body-lg text-on-surface soft-shadow focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            {confirmPassword.length > 0 && !passwordsMatch && (
              <p className="font-body-md text-[12px] text-error mt-2">Les mots de passe ne correspondent pas.</p>
            )}
          </div>

          {error && <p className="font-body-md text-body-md text-error bg-error-container/40 rounded-xl px-4 py-3">{error}</p>}

          <button
            type="submit"
            disabled={!canSubmit}
            className="btn-gradient w-full py-4 rounded-2xl bg-primary text-on-primary font-headline-sm text-headline-sm shadow-[0px_10px_30px_rgba(0,88,188,0.25)] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Mise à jour…" : "Mettre à jour le mot de passe"}
          </button>
        </form>
      </main>
    </div>
  );
}
