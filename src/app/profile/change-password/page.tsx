"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { changePassword } from "@/lib/auth";

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

export default function ChangePasswordPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const criteria = useMemo(
    () => ({
      length: newPassword.length >= 8,
      upper: /[A-Z]/.test(newPassword),
      digit: /[0-9]/.test(newPassword),
      symbol: /[^A-Za-z0-9]/.test(newPassword),
    }),
    [newPassword],
  );
  const score = Object.values(criteria).filter(Boolean).length;
  const strength = STRENGTH_LEVELS[Math.max(score - 1, 0)];
  const passwordsMatch = confirmPassword.length > 0 && newPassword === confirmPassword;

  const canSubmit =
    currentPassword.length > 0 && newPassword.length >= 8 && passwordsMatch && !isSubmitting;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setIsSubmitting(true);
    setError(null);

    const { error: changeError } = await changePassword(currentPassword, newPassword);
    setIsSubmitting(false);

    if (changeError) {
      setError(changeError.message);
      return;
    }

    setSuccess(true);
  };

  if (success) {
    return (
      <div className="bg-background text-on-surface antialiased min-h-screen flex flex-col items-center justify-center px-container-margin text-center gap-4">
        <span className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            check_circle
          </span>
        </span>
        <h1 className="font-headline-sm text-headline-sm text-on-surface font-bold">Mot de passe mis à jour</h1>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-xs">
          Votre mot de passe a été changé avec succès.
        </p>
        <Link
          href="/profile/settings"
          className="mt-2 py-3 px-6 rounded-full font-label-md text-label-md text-white bg-primary hover:opacity-90 transition-opacity"
        >
          Retour aux paramètres
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-background text-on-surface antialiased min-h-screen pb-32">
      <header className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-container-margin min-h-14 pt-[env(safe-area-inset-top)] bg-surface/80 backdrop-blur-xl shadow-sm">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Retour"
          className="text-primary hover:opacity-70 transition-opacity active:scale-95 flex items-center justify-center w-10 h-10 -ml-2 rounded-full"
        >
          <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 0" }}>arrow_back_ios</span>
        </button>
        <h1 className="font-headline-sm text-headline-sm font-extrabold tracking-tight text-on-surface absolute left-1/2 -translate-x-1/2">
          Mot de passe
        </h1>
        <div
          className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-white shadow-sm"
          style={{ background: "linear-gradient(135deg, #0058bc, #5952af)" }}
        >
          <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>key</span>
        </div>
      </header>

      <main className="max-w-md mx-auto px-container-margin pt-[calc(5rem+env(safe-area-inset-top))] pb-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-lg">
          <div>
            <label htmlFor="current-password" className="block font-label-md text-[11px] text-outline uppercase tracking-wider mb-2">
              Mot de passe actuel
            </label>
            <input
              id="current-password"
              type={showPasswords ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Votre mot de passe actuel"
              autoComplete="current-password"
              className="w-full bg-surface-container-lowest border border-surface-container-highest rounded-[16px] px-4 py-4 font-body-lg text-body-lg text-on-surface soft-shadow focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          <div>
            <label htmlFor="new-password" className="block font-label-md text-[11px] text-outline uppercase tracking-wider mb-2">
              Nouveau mot de passe
            </label>
            <div className="relative">
              <input
                id="new-password"
                type={showPasswords ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Créez un nouveau mot de passe"
                autoComplete="new-password"
                className="w-full bg-surface-container-lowest border border-surface-container-highest rounded-[16px] px-4 py-4 pr-12 font-body-lg text-body-lg text-on-surface soft-shadow focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPasswords((v) => !v)}
                aria-label={showPasswords ? "Masquer les mots de passe" : "Afficher les mots de passe"}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showPasswords ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>

            {newPassword.length > 0 && (
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
            <label htmlFor="confirm-new-password" className="block font-label-md text-[11px] text-outline uppercase tracking-wider mb-2">
              Confirmer le nouveau mot de passe
            </label>
            <input
              id="confirm-new-password"
              type={showPasswords ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirmez le nouveau mot de passe"
              autoComplete="new-password"
              className="w-full bg-surface-container-lowest border border-surface-container-highest rounded-[16px] px-4 py-4 font-body-lg text-body-lg text-on-surface soft-shadow focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            {confirmPassword.length > 0 && !passwordsMatch && (
              <p className="mt-2 font-label-md text-label-md text-error">Les mots de passe ne correspondent pas.</p>
            )}
          </div>

          {error && (
            <p className="font-body-md text-body-md text-error bg-error-container/40 rounded-xl px-4 py-3">{error}</p>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full py-4 rounded-2xl bg-primary text-on-primary font-headline-sm text-headline-sm shadow-[0px_10px_30px_rgba(0,88,188,0.25)] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Mise à jour…" : "Mettre à jour le mot de passe"}
          </button>
        </form>
      </main>
    </div>
  );
}
