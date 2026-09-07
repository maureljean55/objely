"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getMatch, type MatchWithItems } from "@/lib/supabase/messages";
import { explainItemMatch } from "@/lib/supabase/matching";
import { getLatestVerification, resolveMatch, type MatchVerification } from "@/lib/supabase/verification";
import type { Item } from "@/lib/supabase/items";

function ItemCard({ item, label, highlighted, dateLabel }: { item: Item; label: string; highlighted: boolean; dateLabel: string }) {
  return (
    <div
      className={`bg-surface-container-lowest rounded-2xl soft-shadow overflow-hidden flex flex-col ${highlighted ? "ring-2 ring-primary" : ""}`}
    >
      <div className={`px-3 py-2 border-b text-center ${highlighted ? "bg-primary/10 border-primary/20" : "bg-surface-container-low border-surface-variant"}`}>
        <span className={`font-label-md text-label-md uppercase ${highlighted ? "text-primary" : "text-on-surface-variant"}`}>{label}</span>
      </div>
      <div className="h-32 bg-surface-container-high flex items-center justify-center text-primary">
        {item.photos?.[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img alt={item.title} className="w-full h-full object-cover" src={item.photos[0]} />
        ) : (
          <span className="material-symbols-outlined text-4xl">{item.category_icon || "inventory_2"}</span>
        )}
      </div>
      <div className="p-3 flex flex-col gap-1">
        <h3 className="font-headline-sm text-headline-sm text-on-surface line-clamp-1">{item.title}</h3>
        <div className={`flex items-center gap-1 ${highlighted ? "text-primary font-medium" : "text-on-surface-variant"}`}>
          <span className="material-symbols-outlined text-[16px]">{highlighted ? "schedule" : "calendar_today"}</span>
          <span className="font-body-md text-body-md text-[13px] line-clamp-1">{dateLabel}</span>
        </div>
        <div className="flex items-center gap-1 text-on-surface-variant">
          <span className="material-symbols-outlined text-[16px]">location_on</span>
          <span className="font-body-md text-body-md text-[13px] line-clamp-1">{item.location || "Lieu non précisé"}</span>
        </div>
      </div>
    </div>
  );
}

function MatchDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const matchId = searchParams.get("match");

  const [match, setMatch] = useState<MatchWithItems | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [verification, setVerification] = useState<MatchVerification | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  useEffect(() => {
    if (!matchId) return;
    Promise.all([getCurrentUser(), getMatch(matchId), getLatestVerification(matchId)]).then(
      ([user, { data, error }, verificationRes]) => {
        if (!user || error || !data) {
          setLoadError(true);
          return;
        }
        setCurrentUserId(user.id);
        setMatch(data);
        setVerification(verificationRes.data ?? null);
      },
    );
  }, [matchId]);

  if (loadError || !matchId) {
    return (
      <div className="bg-background text-on-background antialiased min-h-screen flex flex-col items-center justify-center px-container-margin text-center">
        <p className="font-body-md text-body-md text-on-surface-variant">Correspondance introuvable.</p>
        <Link href="/activity" className="text-primary font-semibold mt-4">
          Retour à l&apos;activité
        </Link>
      </div>
    );
  }

  if (!match || !currentUserId) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <span className="w-8 h-8 border-4 border-primary-container/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const isLostSide = match.lost_item.user_id === currentUserId;
  const myItem = isLostSide ? match.lost_item : match.found_item;
  const otherItem = isLostSide ? match.found_item : match.lost_item;
  const criteria = explainItemMatch(myItem, otherItem);

  const handleReject = async () => {
    setIsRejecting(true);
    await resolveMatch(match.id, false);
    router.push("/activity");
  };

  return (
    <div className="bg-background text-on-background font-body-md antialiased min-h-screen pb-[160px]">
      <header className="glass-header fixed top-0 inset-x-0 z-50 flex items-center justify-between px-container-margin min-h-16 pt-[env(safe-area-inset-top)] w-full shadow-[0_1px_0_rgba(0,0,0,0.05)]">
        <button type="button" onClick={() => router.back()} aria-label="Retour" className="w-10 h-10 flex items-center justify-center rounded-full text-primary hover:bg-surface-container-high/50 transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="font-headline-sm text-headline-sm text-on-surface flex-1 text-center">Correspondance</h1>
        <div className="w-10 h-10" />
      </header>

      <main className="pt-[calc(88px+env(safe-area-inset-top))] px-container-margin max-w-2xl mx-auto flex flex-col gap-lg">
        <section className="text-center">
          <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-1">
            🎉 Une correspondance possible !
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Nous avons trouvé un objet qui pourrait être le vôtre.
          </p>
        </section>

        <section className="relative">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="flex items-center justify-center w-16 h-16 bg-primary text-on-primary rounded-full shadow-md border-4 border-surface-container-lowest">
              <span className="font-headline-sm text-headline-sm">{match.match_percent}%</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-gutter">
            <ItemCard
              item={myItem}
              label={isLostSide ? "Mon objet perdu" : "Mon objet trouvé"}
              highlighted={false}
              dateLabel={`Perdu le ${myItem.occurred_on ? new Date(myItem.occurred_on).toLocaleDateString("fr-FR") : "—"}`}
            />
            <ItemCard
              item={otherItem}
              label={isLostSide ? "Objet trouvé" : "Déclaration de perte"}
              highlighted
              dateLabel={`Trouvé le ${new Date(otherItem.created_at).toLocaleDateString("fr-FR")}`}
            />
          </div>
        </section>

        <section className="bg-surface-container-lowest rounded-2xl p-md soft-shadow">
          <h3 className="font-headline-sm text-headline-sm text-on-surface mb-sm">Détails de la correspondance</h3>
          <ul className="flex flex-col gap-3">
            {criteria.map((criterion) => (
              <li key={criterion.label} className="flex items-center gap-3">
                <div
                  className={
                    criterion.matched
                      ? "w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0"
                      : "w-6 h-6 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant shrink-0"
                  }
                >
                  <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: `'FILL' ${criterion.matched ? 1 : 0}` }}>
                    check_circle
                  </span>
                </div>
                <span className={criterion.matched ? "font-body-md text-body-md text-on-surface" : "font-body-md text-body-md text-on-surface-variant"}>
                  {criterion.label}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {isLostSide && match.status === "pending" && (
          <section className="bg-surface-container-lowest rounded-2xl p-lg soft-shadow flex flex-col items-center text-center gap-2">
            {verification ? (
              <>
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-1">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>hourglass_top</span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Vérification envoyée</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  En attente de confirmation par la personne qui a trouvé l&apos;objet.
                </p>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-secondary/10 text-secondary flex items-center justify-center mb-1">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>lock_open</span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Prouvez que cet objet vous appartient</h3>
                <p className="font-body-md text-body-md text-on-surface-variant mb-1">
                  Répondez à quelques questions de vérification avant de pouvoir échanger.
                </p>
                <Link
                  href={`/ownership-verification?match=${match.id}`}
                  className="w-full h-12 bg-primary text-on-primary rounded-xl font-headline-sm text-headline-sm flex items-center justify-center hover:opacity-90 active:scale-[0.98] transition-all"
                >
                  Répondre aux questions de vérification
                </Link>
              </>
            )}
          </section>
        )}
      </main>

      <div className="fixed bottom-0 inset-x-0 z-50 glass-input px-container-margin py-md safe-area-pb shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="max-w-2xl mx-auto flex flex-col gap-sm">
          <Link
            href={`/chat/${match.id}`}
            className="w-full h-14 bg-primary text-on-primary rounded-xl font-headline-sm text-headline-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all"
          >
            <span className="material-symbols-outlined">forum</span>
            Contacter le déclarant
          </Link>
          <button
            type="button"
            onClick={handleReject}
            disabled={isRejecting}
            className="w-full h-12 bg-[#EBF2FF] text-primary rounded-xl font-headline-sm text-headline-sm hover:brightness-95 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {isRejecting ? "…" : "Ce n'est pas mon objet"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MatchDetailPage() {
  return (
    <Suspense fallback={null}>
      <MatchDetailContent />
    </Suspense>
  );
}
