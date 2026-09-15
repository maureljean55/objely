"use client";

import { useState } from "react";
import { confirmRestitution } from "@/lib/supabase/restitution";

export default function RestitutionConfirmPanel({
  matchId,
  initiallyConfirmed,
  initiallyBothConfirmed,
}: {
  matchId: string;
  initiallyConfirmed: boolean;
  initiallyBothConfirmed: boolean;
}) {
  const [confirmed, setConfirmed] = useState(initiallyConfirmed);
  const [bothConfirmed, setBothConfirmed] = useState(initiallyBothConfirmed);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    const { bothConfirmed: done, error: err } = await confirmRestitution(matchId);
    setLoading(false);
    if (err) {
      setError("Une erreur est survenue, réessayez.");
      return;
    }
    setConfirmed(true);
    if (done) setBothConfirmed(true);
  };

  if (bothConfirmed) {
    return (
      <section className="bg-surface-container-lowest rounded-2xl soft-shadow overflow-hidden">
        <div className="p-lg flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#e8f5e9] text-[#2e7d32] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>task_alt</span>
          </div>
          <div>
            <p className="font-label-md text-[11px] text-outline uppercase tracking-wider">Statut</p>
            <p className="font-headline-sm text-headline-sm text-on-surface">Restitution confirmée par les deux parties</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-surface-container-lowest rounded-2xl soft-shadow p-lg">
      <h2 className="font-headline-sm text-headline-sm text-on-surface mb-1">Objet restitué ?</h2>
      <p className="font-body-md text-body-md text-on-surface-variant mb-md">
        {confirmed
          ? "Vous avez confirmé la restitution. En attente de la confirmation de l'autre personne."
          : "Une fois le rendez-vous passé et l'objet remis, confirmez-le ici. L'objet ne sera marqué comme restitué que lorsque les deux personnes auront confirmé."}
      </p>
      <div className="flex gap-sm">
        <button
          type="button"
          onClick={handleConfirm}
          disabled={confirmed || loading}
          className={`flex-1 h-12 rounded-full font-headline-sm text-headline-sm transition-colors disabled:cursor-not-allowed ${
            confirmed ? "bg-emerald-100 text-emerald-700" : "bg-primary text-on-primary hover:opacity-90 disabled:opacity-60"
          }`}
        >
          {loading ? "…" : confirmed ? "Oui ✓" : "Oui"}
        </button>
        <button
          type="button"
          disabled
          className={`flex-1 h-12 rounded-full font-headline-sm text-headline-sm ${
            confirmed ? "bg-surface-container text-on-surface-variant opacity-50" : "bg-surface-container-high text-on-surface-variant"
          }`}
        >
          Non
        </button>
      </div>
      {error && <p className="font-body-md text-[13px] text-error mt-2">{error}</p>}
    </section>
  );
}
