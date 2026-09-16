"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteAccountButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const close = () => {
    setOpen(false);
    setPassword("");
    setError(null);
  };

  const confirmDelete = async () => {
    if (!password) return;
    setBusy(true);
    setError(null);

    const res = await fetch("/api/account/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const body = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(body.error ?? "Une erreur est survenue.");
      setBusy(false);
      return;
    }

    router.push("/login");
    router.refresh();
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="font-label-md text-label-md text-outline hover:text-error transition-colors underline decoration-outline/30 underline-offset-4"
      >
        Supprimer mon compte
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-[2px]" onClick={busy ? undefined : close} />
          <div className="fixed inset-x-6 top-1/2 -translate-y-1/2 z-[71] max-w-sm mx-auto">
            <div className="bg-surface-container-lowest rounded-[24px] soft-shadow p-lg flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-error-container/40 text-error flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                    warning
                  </span>
                </span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Supprimer votre compte ?</h3>
              </div>

              <p className="font-body-md text-body-md text-on-surface-variant">
                Cette action est <strong>définitive</strong>. Votre profil, vos déclarations d&apos;objets, vos
                messages et votre historique seront supprimés et ne pourront pas être récupérés.
              </p>

              <div>
                <label htmlFor="delete-password" className="block font-label-md text-[11px] text-outline uppercase tracking-wider mb-2">
                  Confirmez avec votre mot de passe
                </label>
                <input
                  id="delete-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="w-full px-4 py-3 rounded-xl border border-outline-variant/60 bg-background font-body-lg text-body-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-error/20 focus:border-error transition-all"
                />
              </div>

              {error && <p className="font-body-md text-body-md text-error">{error}</p>}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={close}
                  disabled={busy}
                  className="flex-1 py-3 rounded-full font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-low transition-colors disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={!password || busy}
                  className="flex-1 py-3 rounded-full font-label-md text-label-md text-white bg-error disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                >
                  {busy ? "Suppression…" : "Supprimer définitivement"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
