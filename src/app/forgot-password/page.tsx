"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { requestPasswordReset } from "@/lib/auth";

const HEADER_HEIGHT = "calc(172px + env(safe-area-inset-top))";

// Recovery e-mails sent through Supabase's default (SMTP-less) provider get
// silently burned by Gmail's link-prefetching before the real click lands —
// see the reset-password page's own comments. Fixing that for real needs a
// custom email template, which needs custom SMTP, which needs a domain we
// don't have yet. Until then, turning the flow off with a clear message
// beats leaving a "forgot password" link that quietly fails for anyone
// using Gmail. Flip this back on once SMTP + the token_hash template are in
// place.
const FORGOT_PASSWORD_ENABLED = false;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  if (!FORGOT_PASSWORD_ENABLED) {
    return (
      <div className="min-h-[100dvh] bg-background flex flex-col">
        <div
          className="fixed top-0 inset-x-0 z-20 bg-background/95 backdrop-blur-md border-b border-outline-variant/20"
          style={{ paddingTop: "env(safe-area-inset-top)" }}
        >
          <div className="w-full max-w-md mx-auto px-container-margin pt-4 pb-4 flex flex-col">
            <Link
              href="/login"
              aria-label="Retour"
              className="-ml-2 w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high/60 transition-colors text-on-surface"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </Link>
          </div>
        </div>

        <main className="w-full max-w-md mx-auto px-container-margin pb-16 flex flex-col items-center justify-center grow text-center gap-3">
          <div className="w-16 h-16 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center mb-2">
            <span className="material-symbols-outlined text-[32px]">construction</span>
          </div>
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">Pas encore disponible</h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-xs">
            La réinitialisation de mot de passe en ligne n&apos;est pas encore disponible. Contactez le support pour
            retrouver l&apos;accès à votre compte.
          </p>
          <Link href="/login" className="text-primary font-semibold mt-2">
            Retour à la connexion
          </Link>
        </main>
      </div>
    );
  }

  const canSubmit = email.trim().length > 0 && !isSubmitting;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setIsSubmitting(true);
    setError(null);

    const { error: resetError } = await requestPasswordReset(email);
    setIsSubmitting(false);

    if (resetError) {
      setError(/rate limit/i.test(resetError.message) ? "Trop de demandes récemment, réessayez dans quelques minutes." : resetError.message);
      return;
    }

    // Supabase doesn't reveal whether the address is actually registered —
    // showing the same confirmation either way avoids leaking which emails
    // have an account.
    setSent(true);
  };

  if (sent) {
    return (
      <div className="min-h-[100dvh] bg-background flex flex-col items-center justify-center px-container-margin text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-[32px]">mark_email_read</span>
        </div>
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-2">Vérifiez votre e-mail</h1>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-xs mb-6">
          Si un compte existe pour <span className="font-semibold text-on-surface">{email}</span>, un lien de réinitialisation vient de lui être envoyé.
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
          <Link
            href="/login"
            aria-label="Retour"
            className="-ml-2 w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high/60 transition-colors text-on-surface"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div className="flex flex-col items-center mt-2">
            <div className="flex items-center gap-2 mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo/objely-mark.png" alt="" className="w-9 h-9" />
              <span className="font-headline-sm text-headline-sm font-bold text-on-surface">Objely</span>
            </div>
          </div>
        </div>
      </div>

      <main className="w-full max-w-md mx-auto px-container-margin pb-16 flex flex-col grow" style={{ paddingTop: HEADER_HEIGHT }}>
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-2 mt-lg">Mot de passe oublié ?</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mb-xl">
          Indiquez votre e-mail, nous vous enverrons un lien pour choisir un nouveau mot de passe.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-lg">
          <div>
            <label htmlFor="email" className="block font-body-md text-body-md font-semibold text-on-surface mb-2">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              autoComplete="email"
              autoFocus
              className="w-full px-4 py-4 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest font-body-lg text-body-lg text-on-surface soft-shadow focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          {error && <p className="font-body-md text-body-md text-error bg-error-container/40 rounded-xl px-4 py-3">{error}</p>}

          <button
            type="submit"
            disabled={!canSubmit}
            className="btn-gradient w-full py-4 rounded-2xl bg-primary text-on-primary font-headline-sm text-headline-sm shadow-[0px_10px_30px_rgba(0,88,188,0.25)] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Envoi…" : "Envoyer le lien"}
          </button>
        </form>
      </main>
    </div>
  );
}
