"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type EnrollState = {
  factorId: string;
  qrCode: string;
  secret: string;
};

export default function TwoFactorAuthSection() {
  const [loading, setLoading] = useState(true);
  const [enabled, setEnabled] = useState(false);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [enroll, setEnroll] = useState<EnrollState | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmingDisable, setConfirmingDisable] = useState(false);

  const refreshFactors = async () => {
    const supabase = createClient();
    const { data } = await supabase.auth.mfa.listFactors();
    const verified = data?.totp?.find((f) => f.status === "verified") ?? null;
    setEnabled(!!verified);
    setFactorId(verified?.id ?? null);
    setLoading(false);
  };

  useEffect(() => {
    Promise.resolve().then(() => refreshFactors());
  }, []);

  const startEnroll = async () => {
    setError(null);
    setBusy(true);
    const supabase = createClient();
    const { data, error: enrollError } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: `Objely ${new Date().toLocaleDateString("fr-FR")}`,
    });
    setBusy(false);
    if (enrollError || !data) {
      setError(enrollError?.message ?? "Impossible de démarrer l'activation.");
      return;
    }
    setEnroll({ factorId: data.id, qrCode: data.totp.qr_code, secret: data.totp.secret });
  };

  const confirmEnroll = async () => {
    if (!enroll || code.length < 6) return;
    setError(null);
    setBusy(true);
    const supabase = createClient();
    const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify({
      factorId: enroll.factorId,
      code,
    });
    setBusy(false);
    if (verifyError) {
      setError("Code incorrect. Vérifiez votre application d'authentification et réessayez.");
      return;
    }
    setEnroll(null);
    setCode("");
    await refreshFactors();
  };

  const cancelEnroll = async () => {
    // Drop the still-unverified factor instead of leaving it dangling —
    // otherwise a future enroll attempt with the same friendly name fails.
    if (enroll) {
      const supabase = createClient();
      await supabase.auth.mfa.unenroll({ factorId: enroll.factorId });
    }
    setEnroll(null);
    setCode("");
    setError(null);
  };

  const disable = async () => {
    if (!factorId) return;
    setError(null);
    setBusy(true);
    const supabase = createClient();
    const { error: unenrollError } = await supabase.auth.mfa.unenroll({ factorId });
    setBusy(false);
    setConfirmingDisable(false);
    if (unenrollError) {
      setError(unenrollError.message);
      return;
    }
    await refreshFactors();
  };

  return (
    <section className="bg-surface-container-lowest rounded-xl soft-shadow overflow-hidden">
      <div className="px-4 py-3 bg-surface-container-low border-b border-outline-variant/30">
        <h3 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-on-surface-variant">verified_user</span>
          Double authentification
        </h3>
      </div>

      <div className="p-4 flex flex-col gap-4">
        {loading ? (
          <p className="font-body-md text-body-md text-on-surface-variant">Chargement…</p>
        ) : enroll ? (
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="font-body-md text-body-md text-on-surface-variant">
              Scannez ce QR code avec votre application d&apos;authentification (Google Authenticator, Authy…), puis
              entrez le code à 6 chiffres généré.
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={enroll.qrCode} alt="QR code de double authentification" className="w-44 h-44 rounded-xl bg-white p-2" />
            <p className="font-label-md text-[11px] text-outline break-all">
              Ou saisissez ce code manuellement : <span className="font-mono">{enroll.secret}</span>
            </p>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="000000"
              className="w-32 text-center tracking-[0.4em] font-headline-sm text-headline-sm px-4 py-3 rounded-xl border border-outline-variant/60 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            {error && <p className="font-body-md text-body-md text-error">{error}</p>}
            <div className="flex gap-2 w-full">
              <button
                type="button"
                onClick={cancelEnroll}
                className="flex-1 py-3 rounded-full font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-low transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={confirmEnroll}
                disabled={code.length < 6 || busy}
                className="flex-1 py-3 rounded-full font-label-md text-label-md text-white bg-primary disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
              >
                Confirmer
              </button>
            </div>
          </div>
        ) : enabled ? (
          <>
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                  check_circle
                </span>
              </span>
              <div>
                <p className="font-body-lg text-body-lg text-on-surface font-semibold">Activée</p>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Un code de votre application d&apos;authentification vous sera demandé à chaque connexion.
                </p>
              </div>
            </div>
            {error && <p className="font-body-md text-body-md text-error">{error}</p>}
            {confirmingDisable ? (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmingDisable(false)}
                  className="flex-1 py-3 rounded-full font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-low transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={disable}
                  disabled={busy}
                  className="flex-1 py-3 rounded-full font-label-md text-label-md text-white bg-error disabled:opacity-50 hover:opacity-90 transition-opacity"
                >
                  Confirmer la désactivation
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmingDisable(true)}
                className="font-label-md text-label-md text-error self-start"
              >
                Désactiver la double authentification
              </button>
            )}
          </>
        ) : (
          <>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Ajoutez une couche de sécurité : même si votre mot de passe est compromis, personne ne pourra se
              connecter sans le code de votre application d&apos;authentification.
            </p>
            {error && <p className="font-body-md text-body-md text-error">{error}</p>}
            <button
              type="button"
              onClick={startEnroll}
              disabled={busy}
              className="self-start py-3 px-5 rounded-full font-label-md text-label-md text-white bg-primary disabled:opacity-50 hover:opacity-90 transition-opacity"
            >
              Activer la double authentification
            </button>
          </>
        )}
      </div>
    </section>
  );
}
