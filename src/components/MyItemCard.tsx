"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Item } from "@/lib/supabase/items";
import { softDeleteItem } from "@/lib/supabase/items";

const STATUS_BADGE = {
  searching: { label: "Recherche active", icon: "radar", className: "bg-error-container text-on-error-container" },
  matched: { label: "Correspondance trouvée", icon: "task_alt", className: "bg-primary-fixed text-primary" },
  recovered: { label: "Retrouvé", icon: "check_circle", className: "bg-[#e8f5e9] text-[#2e7d32]" },
  returned: { label: "Restitué", icon: "check_circle", className: "bg-[#e8f5e9] text-[#2e7d32]" },
} as const;

function declaredDateLabel(item: Item) {
  const verb = item.type === "lost" ? "Perdu" : "Trouvé";
  if (!item.occurred_on) return verb;
  return `${verb} le ${new Date(item.occurred_on).toLocaleDateString("fr-FR")}`;
}

type Step = "closed" | "resolved" | "confirm" | "reason" | "deleting";

function DialogShell({ children }: { children: React.ReactNode }) {
  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
      <div className="bg-surface-container-lowest w-[300px] rounded-xl overflow-hidden shadow-xl relative">{children}</div>
    </div>
  );
}

export default function MyItemCard({ item }: { item: Item }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("closed");
  const [reason, setReason] = useState("");
  const [hidden, setHidden] = useState(false);
  const badge = STATUS_BADGE[item.status];

  if (hidden) return null;

  const resolvedQuestion =
    item.type === "lost" ? "Avez-vous retrouvé votre objet ?" : "Avez-vous restitué l'objet à son propriétaire ?";
  const notResolvedPhrase = item.type === "lost" ? "retrouvé votre objet" : "restitué l'objet";

  const finalizeDelete = async (resolved: boolean, deletionReason?: string) => {
    setStep("deleting");
    await softDeleteItem(item.id, resolved, deletionReason);
    setHidden(true);
    router.refresh();
  };

  return (
    <>
      <div className="relative">
        <Link
          href={`/search/${item.id}`}
          className="block bg-surface rounded-lg shadow-soft-bloom overflow-hidden border border-black/5 hover:scale-[1.02] transition-transform duration-300"
        >
          <div className="h-48 w-full relative bg-surface-container-high flex items-center justify-center text-primary">
            {item.photos?.[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img alt={item.title} className="w-full h-full object-cover rounded-t-lg" src={item.photos[0]} />
            ) : (
              <span className="material-symbols-outlined text-5xl">{item.category_icon || "inventory_2"}</span>
            )}
            <div
              className={`absolute top-sm right-sm px-3 py-1 rounded-full font-label-md flex items-center gap-1 shadow-sm backdrop-blur-md bg-opacity-90 ${badge.className}`}
            >
              <span className="material-symbols-outlined text-[14px]">{badge.icon}</span>
              {badge.label}
            </div>
          </div>
          <div className="p-md flex flex-col gap-sm bg-surface">
            <div className="flex justify-between items-start">
              <h2 className="font-headline-sm text-on-surface font-semibold line-clamp-1">{item.title}</h2>
              <span className="text-outline text-[12px] font-label-md whitespace-nowrap">
                {item.type === "lost" ? "Perdu par moi" : "Trouvé par moi"}
              </span>
            </div>
            <div className="flex flex-col gap-1 text-on-surface-variant font-label-md">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                <span>{declaredDateLabel(item)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">location_on</span>
                <span>{item.location || "Lieu non précisé"}</span>
              </div>
            </div>
          </div>
        </Link>

        <button
          type="button"
          onClick={() => setStep("resolved")}
          aria-label="Supprimer la déclaration"
          className="absolute top-sm left-sm w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors z-10"
        >
          <span className="material-symbols-outlined text-[18px]">delete</span>
        </button>
      </div>

      {step === "resolved" && (
        <DialogShell>
          <div className="pt-lg pb-md px-md text-center border-b border-surface-variant/50">
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">{resolvedQuestion}</h3>
          </div>
          <div className="flex flex-col w-full">
            <button
              type="button"
              onClick={() => finalizeDelete(true)}
              className="w-full py-3 text-center border-b border-surface-variant/50 text-primary font-headline-sm text-headline-sm active:bg-surface-variant/50 transition-colors"
            >
              Oui
            </button>
            <button
              type="button"
              onClick={() => setStep("confirm")}
              className="w-full py-3 text-center text-on-surface-variant font-body-lg text-body-lg active:bg-surface-variant/50 transition-colors"
            >
              Non
            </button>
          </div>
        </DialogShell>
      )}

      {step === "confirm" && (
        <DialogShell>
          <div className="pt-lg pb-md px-md text-center border-b border-surface-variant/50">
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">Confirmer la suppression</h3>
            <p className="font-body-md text-body-md text-[13px] text-on-surface-variant leading-tight">
              Êtes-vous sûr de vouloir supprimer la déclaration sans avoir {notResolvedPhrase} ?
            </p>
          </div>
          <div className="flex flex-col w-full">
            <button
              type="button"
              onClick={() => setStep("reason")}
              className="w-full py-3 text-center border-b border-surface-variant/50 text-error font-headline-sm text-headline-sm active:bg-surface-variant/50 transition-colors"
            >
              Oui, supprimer
            </button>
            <button
              type="button"
              onClick={() => setStep("closed")}
              className="w-full py-3 text-center text-on-surface-variant font-body-lg text-body-lg active:bg-surface-variant/50 transition-colors"
            >
              Annuler
            </button>
          </div>
        </DialogShell>
      )}

      {step === "reason" && (
        <DialogShell>
          <button
            type="button"
            onClick={() => finalizeDelete(false)}
            aria-label="Ignorer"
            className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
          <div className="pt-lg pb-md px-md text-center">
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-3 pr-4">
              Pourquoi avez-vous supprimé votre déclaration ?
            </h3>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Votre réponse (facultatif)..."
              className="w-full bg-surface-container border border-outline-variant/40 rounded-xl p-3 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>
          <button
            type="button"
            onClick={() => finalizeDelete(false, reason)}
            className="w-full py-3 text-center border-t border-surface-variant/50 text-primary font-headline-sm text-headline-sm active:bg-surface-variant/50 transition-colors"
          >
            Envoyer
          </button>
        </DialogShell>
      )}

      {step === "deleting" && (
        <DialogShell>
          <div className="p-xl flex items-center justify-center">
            <span className="w-8 h-8 border-4 border-primary-container/30 border-t-primary rounded-full animate-spin" />
          </div>
        </DialogShell>
      )}
    </>
  );
}
