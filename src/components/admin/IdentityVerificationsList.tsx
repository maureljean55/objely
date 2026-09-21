"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminIdentityVerification } from "@/lib/admin/identityVerifications";

const STATUS_LABELS: Record<AdminIdentityVerification["status"], string> = {
  pending: "En attente",
  approved: "Approuvé",
  rejected: "Refusé",
};

const STATUS_BADGE_STYLES: Record<AdminIdentityVerification["status"], string> = {
  pending: "bg-secondary-container text-on-secondary-container",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-error-container text-on-error-container",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" });
}

export default function IdentityVerificationsList({ verifications }: { verifications: AdminIdentityVerification[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected" | "all">("pending");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const visible = verifications.filter((v) => filter === "all" || v.status === filter);

  const decide = async (verification: AdminIdentityVerification, action: "approve" | "reject", reason?: string) => {
    setPendingId(verification.id);
    const res = await fetch(`/api/admin/identity-verifications/${verification.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, reason }),
    });
    setPendingId(null);
    setRejectingId(null);
    setRejectReason("");
    if (res.ok) router.refresh();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        {(["pending", "approved", "rejected", "all"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full font-label-md text-label-md transition-colors ${
              filter === f ? "bg-primary text-on-primary" : "bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container"
            }`}
          >
            {f === "pending" ? "En attente" : f === "approved" ? "Approuvés" : f === "rejected" ? "Refusés" : "Tous"}
          </button>
        ))}
      </div>

      {visible.length === 0 && (
        <p className="font-body-md text-body-md text-on-surface-variant py-12 text-center">Aucune vérification dans cette catégorie.</p>
      )}

      <div className="flex flex-col gap-3">
        {visible.map((verification) => (
          <div key={verification.id} className="bg-surface-container-lowest rounded-xl soft-shadow p-4 flex flex-col gap-3 sm:flex-row sm:items-start">
            {verification.documentUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- signed URL from a private bucket, not an optimizable remote domain
              <img
                src={verification.documentUrl}
                alt="Document d'identité"
                className="w-full sm:w-48 aspect-[4/3] object-cover rounded-lg bg-surface-container shrink-0"
              />
            ) : (
              <div className="w-full sm:w-48 aspect-[4/3] rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant shrink-0">
                Document indisponible
              </div>
            )}

            <div className="flex flex-col gap-2 flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2 py-0.5 rounded-full font-label-md text-label-md ${STATUS_BADGE_STYLES[verification.status]}`}>
                    {STATUS_LABELS[verification.status]}
                  </span>
                  <span className="font-body-md text-body-md text-on-surface-variant">
                    {verification.user ? `${verification.user.full_name ?? "Utilisateur"} (@${verification.user.public_id})` : "Utilisateur supprimé"}
                  </span>
                </div>
                <span className="font-body-md text-body-md text-on-surface-variant shrink-0">{formatDate(verification.created_at)}</span>
              </div>

              {verification.status !== "pending" && (
                <p className="font-body-md text-body-md text-on-surface-variant">
                  {verification.status === "approved" ? "Approuvé" : "Refusé"} le {formatDate(verification.reviewed_at!)} par {verification.reviewed_by}
                  {verification.status === "rejected" && verification.rejection_reason && ` — ${verification.rejection_reason}`}
                </p>
              )}

              {verification.status === "pending" && (
                <div className="flex items-center gap-2 mt-1 pt-2 border-t border-outline-variant/30">
                  <button
                    onClick={() => decide(verification, "approve")}
                    disabled={pendingId === verification.id}
                    className="font-label-md text-label-md px-3 py-1.5 rounded-full bg-primary text-on-primary hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    Approuver
                  </button>
                  {rejectingId === verification.id ? (
                    <>
                      <input
                        autoFocus
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Raison du refus (optionnel)"
                        className="flex-1 min-w-[160px] px-3 py-1.5 rounded-full bg-surface-container border border-outline-variant/50 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary"
                      />
                      <button
                        onClick={() => decide(verification, "reject", rejectReason)}
                        disabled={pendingId === verification.id}
                        className="font-label-md text-label-md px-3 py-1.5 rounded-full bg-error text-on-error hover:opacity-90 transition-opacity disabled:opacity-50"
                      >
                        Confirmer le refus
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setRejectingId(verification.id)}
                      disabled={pendingId === verification.id}
                      className="font-label-md text-label-md px-3 py-1.5 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors disabled:opacity-50"
                    >
                      Refuser
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
