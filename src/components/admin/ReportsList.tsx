"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORY_LABELS } from "@/lib/supabase/reports";
import type { AdminProblemReport } from "@/lib/admin/reports";

const CATEGORY_BADGE_STYLES: Record<string, string> = {
  tech: "bg-secondary-container text-on-secondary-container",
  fake: "bg-error-container text-on-error-container",
  info: "bg-tertiary-fixed text-on-tertiary-fixed-variant",
  other: "bg-surface-container text-on-surface-variant",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" });
}

export default function ReportsList({ reports }: { reports: AdminProblemReport[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "open" | "resolved">("open");
  const [pendingId, setPendingId] = useState<string | null>(null);

  const visible = reports.filter((r) => {
    if (filter === "all") return true;
    return filter === "resolved" ? r.resolved_at !== null : r.resolved_at === null;
  });

  const toggleResolved = async (report: AdminProblemReport) => {
    const action = report.resolved_at === null ? "resolve" : "reopen";
    setPendingId(report.id);
    const res = await fetch(`/api/admin/signalements/${report.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setPendingId(null);
    if (res.ok) router.refresh();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        {(["open", "resolved", "all"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full font-label-md text-label-md transition-colors ${
              filter === f ? "bg-primary text-on-primary" : "bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container"
            }`}
          >
            {f === "open" ? "En cours" : f === "resolved" ? "Résolus" : "Tous"}
          </button>
        ))}
      </div>

      {visible.length === 0 && (
        <p className="font-body-md text-body-md text-on-surface-variant py-12 text-center">Aucun signalement dans cette catégorie.</p>
      )}

      <div className="flex flex-col gap-3">
        {visible.map((report) => {
          const isResolved = report.resolved_at !== null;
          return (
            <div key={report.id} className="bg-surface-container-lowest rounded-xl soft-shadow p-4 flex flex-col gap-2">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2 py-0.5 rounded-full font-label-md text-label-md ${CATEGORY_BADGE_STYLES[report.category]}`}>
                    {CATEGORY_LABELS[report.category]}
                  </span>
                  <span className="font-body-md text-body-md text-on-surface-variant">
                    {report.reporter ? `${report.reporter.full_name ?? "Utilisateur"} (@${report.reporter.public_id})` : "Utilisateur supprimé"}
                  </span>
                </div>
                <span className="font-body-md text-body-md text-on-surface-variant shrink-0">{formatDate(report.created_at)}</span>
              </div>

              <p className="font-body-lg text-body-lg text-on-surface whitespace-pre-wrap">{report.description}</p>

              {report.item && (
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Objet concerné : <span className="text-on-surface">{report.item.title}</span>
                </p>
              )}

              <div className="flex items-center justify-between mt-2 pt-2 border-t border-outline-variant/30">
                <span className={`font-label-md text-label-md ${isResolved ? "text-on-surface-variant" : "text-primary font-semibold"}`}>
                  {isResolved ? `Résolu le ${formatDate(report.resolved_at!)} par ${report.resolved_by}` : "En attente de traitement"}
                </span>
                <button
                  onClick={() => toggleResolved(report)}
                  disabled={pendingId === report.id}
                  className="font-label-md text-label-md px-3 py-1.5 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors disabled:opacity-50"
                >
                  {isResolved ? "Rouvrir" : "Marquer résolu"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
