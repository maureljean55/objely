"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Item } from "@/lib/supabase/items";
import { softDeleteItem } from "@/lib/supabase/items";

const STATUS_STYLE = {
  searching: { icon: "radar", badgeClassName: "bg-primary-container text-on-primary-container", pulse: true },
  matched: { icon: "auto_awesome", badgeClassName: "bg-primary text-on-primary", pulse: false },
  recovered: { icon: "task_alt", badgeClassName: "bg-surface-container-highest text-on-surface", pulse: false },
  returned: { icon: "task_alt", badgeClassName: "bg-surface-container-highest text-on-surface", pulse: false },
} as const;

function declaredDateLabel(item: Item) {
  const verb = item.type === "lost" ? "Perdu" : "Trouvé";
  if (!item.occurred_on) return verb;
  return `${verb} le ${new Date(item.occurred_on).toLocaleDateString("fr-FR")}`;
}

function resolvedDateLabel(item: Item) {
  const verb = item.status === "returned" ? "Restitué" : "Retrouvé";
  return `${verb} le ${new Date(item.updated_at).toLocaleDateString("fr-FR")}`;
}

type Step = "closed" | "menu" | "resolved" | "confirm" | "reason" | "deleting";

function DialogShell({ children }: { children: React.ReactNode }) {
  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
      <div className="bg-surface-container-lowest w-[300px] rounded-xl overflow-hidden shadow-xl relative">{children}</div>
    </div>
  );
}

export default function MyItemCard({ item, match }: { item: Item; match?: { id: string; percent: number } }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("closed");
  const [reason, setReason] = useState("");
  const [hidden, setHidden] = useState(false);
  const statusStyle = STATUS_STYLE[item.status];
  const isResolved = item.status === "recovered" || item.status === "returned";

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
      <article className="relative bg-surface-container-lowest rounded-2xl p-md shadow-sm flex flex-col gap-sm overflow-hidden">
        <Link href={`/search/${item.id}`} className="flex gap-md items-start">
          <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-surface-container flex items-center justify-center text-on-surface-variant">
            {item.photos?.[0] ? (
              <Image alt={item.title} src={item.photos[0]} fill sizes="80px" className="object-cover" />
            ) : (
              <span className="material-symbols-outlined text-3xl">{item.category_icon || "inventory_2"}</span>
            )}
            <div className={`absolute bottom-1 right-1 w-5 h-5 rounded-full flex items-center justify-center shadow-sm ${statusStyle.badgeClassName}`}>
              <span className={`material-symbols-outlined text-[12px] ${statusStyle.pulse ? "animate-pulse" : ""}`}>{statusStyle.icon}</span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface truncate">{item.title}</h3>
            <div className="flex items-center gap-1.5 pt-0.5">
              <span
                className={`px-2 py-0.5 rounded-full font-label-md text-[11px] font-semibold shrink-0 ${
                  item.type === "lost" ? "bg-error-container text-on-error-container" : "bg-surface-container text-on-surface-variant"
                }`}
              >
                {item.type === "lost" ? "Objet perdu" : "Objet trouvé"}
              </span>
              <span className="font-label-md text-[11px] text-outline truncate">• {item.location || declaredDateLabel(item)}</span>
            </div>
            <div
              className={`pt-1.5 flex items-center gap-1 ${
                item.status === "matched" ? "text-primary" : isResolved ? "text-on-surface-variant" : "text-primary"
              }`}
            >
              {item.status === "matched" && match && (
                <>
                  <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                  <span className="font-label-md text-[12px] font-semibold">{match.percent}% de correspondance</span>
                </>
              )}
              {item.status === "searching" && (
                <>
                  <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
                  <span className="font-label-md text-[12px] font-semibold">Recherche active</span>
                </>
              )}
              {isResolved && (
                <>
                  <span className="material-symbols-outlined text-[16px]">task_alt</span>
                  <span className="font-label-md text-[12px] font-semibold">{resolvedDateLabel(item)}</span>
                </>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setStep("menu");
            }}
            aria-label="Options"
            className="w-8 h-8 rounded-full flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container transition-all shrink-0"
          >
            <span className="material-symbols-outlined text-[20px]">more_horiz</span>
          </button>
        </Link>

        {item.status === "matched" && match && (
          <div className="rounded-xl p-sm bg-surface-container-low flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-[12px] font-medium text-on-surface">Une correspondance a été détectée pour cet objet.</span>
              <span className="font-label-md text-[12px] font-bold text-primary shrink-0 ml-2">Prêt</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-surface-container-high overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: `${match.percent}%` }} />
            </div>
          </div>
        )}

        {item.status === "matched" && match ? (
          <div className="flex items-center gap-sm pt-1">
            <Link
              href={`/activity/match?match=${match.id}`}
              className="flex-1 h-11 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-semibold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
              Voir la correspondance
            </Link>
            <Link
              href={`/search/${item.id}`}
              className="px-4 h-11 rounded-xl bg-surface-container-low text-on-surface font-label-md text-label-md font-semibold hover:bg-surface-container transition-all active:scale-95 flex items-center justify-center"
            >
              Détails
            </Link>
          </div>
        ) : isResolved ? (
          <div className="flex items-center justify-between px-sm py-2 rounded-xl bg-surface-container-low">
            <span className="font-label-md text-[12px] text-on-surface-variant">
              {item.type === "lost" ? "Objet retrouvé et déclaration clôturée." : "Propriétaire identifié et objet remis en mains propres."}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface font-label-md text-[11px] font-bold shrink-0 ml-2">
              Clôturé
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-between px-sm py-2 rounded-xl bg-surface-container-low">
            <span className="font-body-md text-body-md text-[13px] text-on-surface-variant">
              {item.type === "lost"
                ? "Objely recherche activement une correspondance pour cet objet."
                : "Cet objet est visible par les personnes qui l'ont perdu."}
            </span>
            <Link href={`/search/${item.id}`} className="text-primary font-label-md text-[12px] font-bold hover:underline shrink-0 ml-2">
              Détails
            </Link>
          </div>
        )}
      </article>

      {step === "menu" && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/30 backdrop-blur-sm"
          onClick={() => setStep("closed")}
        >
          <div className="w-full max-w-[420px] px-3 pb-3 safe-area-pb flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
            <div className="bg-surface-container-lowest/95 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl">
              <div className="px-4 pt-3 pb-2.5 text-center border-b border-outline-variant/20">
                <p className="font-label-md text-[12px] text-on-surface-variant truncate">{item.title}</p>
              </div>
              <Link
                href={`/search/${item.id}`}
                className="w-full py-3.5 px-4 flex items-center gap-3 text-on-surface font-body-lg text-body-lg active:bg-surface-container-high/60 transition-colors border-b border-outline-variant/20"
              >
                <span className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[19px]">visibility</span>
                </span>
                Voir les détails
              </Link>
              <button
                type="button"
                onClick={() => setStep("resolved")}
                className="w-full py-3.5 px-4 flex items-center gap-3 text-error font-body-lg text-body-lg font-semibold active:bg-error-container/30 transition-colors"
              >
                <span className="w-9 h-9 rounded-full bg-error-container text-error flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[19px]">delete</span>
                </span>
                Supprimer la déclaration
              </button>
            </div>
            <button
              type="button"
              onClick={() => setStep("closed")}
              className="w-full py-3.5 bg-surface-container-lowest/95 backdrop-blur-xl rounded-3xl text-center text-primary font-headline-sm text-headline-sm shadow-2xl active:bg-surface-container-high/60 transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

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
