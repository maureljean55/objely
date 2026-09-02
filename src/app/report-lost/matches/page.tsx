"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loadDraft, saveDraft, type DeclarationDraft } from "@/lib/declarationDraft";

const RADIUS = 40;
const CIRCUMFERENCE = RADIUS * 2 * Math.PI;
const MATCH_PERCENT = 96;

const CRITERIA = ["Même catégorie", "Couleur similaire", "Marque similaire", "Zone proche", "Description similaire"];

export default function DeclarationMatchesPage() {
  const router = useRouter();
  const [draft, setDraft] = useState<DeclarationDraft>({});
  const [phase, setPhase] = useState<"checking" | "match" | "no-match">("checking");
  const [ringOffset, setRingOffset] = useState(CIRCUMFERENCE);
  const [surveillance, setSurveillance] = useState(true);

  useEffect(() => {
    const d = loadDraft();
    // sessionStorage is only readable client-side, so this can't happen
    // during render without risking an SSR/hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraft(d);
    const hasMatch = d.categoryId === "wallet";
    const timer = setTimeout(() => setPhase(hasMatch ? "match" : "no-match"), 1100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (phase !== "match") return;
    const timer = setTimeout(() => setRingOffset(CIRCUMFERENCE - (MATCH_PERCENT / 100) * CIRCUMFERENCE), 200);
    return () => clearTimeout(timer);
  }, [phase]);

  return (
    <div className="bg-background text-on-background antialiased min-h-screen flex flex-col font-body-md">
      <header className="bg-surface/80 backdrop-blur-xl sticky top-0 flex items-center justify-between px-container-margin h-16 w-full z-50">
        <Link href="/report-lost/location" aria-label="Retour" className="p-2 -ml-2 text-primary hover:opacity-70 transition-opacity active:scale-95">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <h1 className="font-headline-sm text-headline-sm text-on-surface truncate px-4">Déclarer un objet</h1>
        <Link href="/home" aria-label="Fermer" className="p-2 -mr-2 text-on-surface-variant hover:opacity-70 transition-opacity active:scale-95">
          <span className="material-symbols-outlined">close</span>
        </Link>
      </header>

      <main className="grow px-container-margin pt-lg pb-[200px] max-w-2xl mx-auto w-full">
        <div className="mb-lg">
          <div className="flex gap-1 mb-2">
            <div className="h-1 flex-1 rounded-full bg-primary-container" />
            <div className="h-1 flex-1 rounded-full bg-primary-container" />
            <div className="h-1 flex-1 rounded-full bg-primary-container" />
            <div className="h-1 flex-1 rounded-full progress-gradient" />
          </div>
          <p className="font-label-md text-[11px] text-on-surface-variant text-right">Étape 4 sur 4</p>
        </div>

        <div className="mb-lg space-y-2">
          <h2 className="font-headline-md text-headline-md text-on-background">Vérifions d&apos;abord...</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant">Nous recherchons des objets trouvés qui pourraient correspondre au vôtre.</p>
        </div>

        {phase === "checking" && (
          <div className="flex flex-col items-center justify-center py-xl gap-4">
            <div className="w-16 h-16 rounded-full border-4 border-primary-container/30 border-t-primary-container animate-spin" />
            <p className="font-body-md text-body-md text-on-surface-variant">Recherche en cours...</p>
          </div>
        )}

        {phase === "match" && (
          <>
            <div className="flex flex-col items-center justify-center py-lg mb-lg">
              <div className="relative flex items-center justify-center w-24 h-24 mb-md">
                <svg className="w-full h-full absolute" viewBox="0 0 100 100">
                  <circle className="text-surface-container-highest stroke-current" cx="50" cy="50" fill="transparent" r={RADIUS} strokeWidth="6" />
                  <circle
                    className="text-primary stroke-current"
                    cx="50"
                    cy="50"
                    fill="transparent"
                    r={RADIUS}
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={CIRCUMFERENCE}
                    strokeDashoffset={ringOffset}
                    style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%", transition: "stroke-dashoffset 1s ease-in-out" }}
                  />
                </svg>
                <div className="bg-primary text-on-primary rounded-full p-4 z-10 shadow-md">
                  <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                </div>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-primary mb-1">Une correspondance possible !</h3>
              <p className="font-label-md text-label-md text-primary bg-primary-fixed px-3 py-1 rounded-full">{MATCH_PERCENT}% de correspondance</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-lg">
              <div className="bg-surface-container-lowest rounded-[24px] soft-shadow overflow-hidden flex flex-col">
                <div className="bg-surface-variant px-3 py-2 border-b border-surface-container-high">
                  <span className="font-label-md text-[10px] text-on-surface-variant uppercase">Votre objet</span>
                </div>
                <div className="aspect-square w-full relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt="Votre portefeuille"
                    className="absolute inset-0 w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuABkokfB-6YcPQUUtsM0pA1Pa6HZ13v6ZxMAAXI5_aqG-eGKPWWWVZCGB-cWIiJcKSWJAmaqI3LelDhhjzb3VnCf1KcNqB0mM2YZ_p2MCnWDE6hPsKSR3l6aqURBjMWvOm3PvspKMbBE5y_tC3IIeGHIr2DPXnBQl8pIDSd3GMwW_FjnM2hU-Tz4cTIUbv7WwsaN_ECxtteDsuKmmn3P2L8wPNX0VEZu3jy8Xd4zHZAQX4EEV6ViEw7"
                  />
                </div>
                <div className="p-3 grow flex flex-col gap-1">
                  <h4 className="font-headline-sm text-headline-sm text-on-surface line-clamp-1">{draft.objectName || "Portefeuille"}</h4>
                  <div className="flex items-center text-on-surface-variant gap-1 mt-auto">
                    <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                    <span className="font-body-md text-[13px] truncate">Perdu le {draft.date ? new Date(draft.date).toLocaleDateString("fr-FR") : "12 oct."}</span>
                  </div>
                  <div className="flex items-center text-on-surface-variant gap-1">
                    <span className="material-symbols-outlined text-[16px]">location_on</span>
                    <span className="font-body-md text-[13px] truncate">{draft.location || "Paris 10e"}</span>
                  </div>
                </div>
              </div>

              <div className="bg-surface-container-lowest rounded-[24px] soft-shadow overflow-hidden flex flex-col ring-2 ring-primary">
                <div className="bg-primary-fixed px-3 py-2 border-b border-primary-fixed-dim">
                  <span className="font-label-md text-[10px] text-primary-container uppercase">Objet trouvé</span>
                </div>
                <div className="aspect-square w-full relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt="Portefeuille trouvé"
                    className="absolute inset-0 w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAuycBra52OqhjZjU2k7xhPsKCf8iRng8QTztYHnbpxk5qHviFrqjM_EvKxCVUYjddBZRzrnqPDKC4V5i6fhdRJUPYl3gOJ-t5neDyrGVI3_VAvRBHJTmxa1FpZvAiXbrXCOH3xpLv6aYqmUnCzOhf0PaCLISinlxe6lOswy4Xokn_j8x2rqeP2e_h5oQ0jWnynp9KtT9E6Gja5cfF0PhxEMzIeyh-RGVqyI7AgBDTGWPj_l6ceRno_"
                  />
                </div>
                <div className="p-3 grow flex flex-col gap-1">
                  <h4 className="font-headline-sm text-headline-sm text-on-surface line-clamp-1">Portefeuille marron</h4>
                  <div className="flex items-center text-primary gap-1 mt-auto">
                    <span className="material-symbols-outlined text-[16px]">schedule</span>
                    <span className="font-body-md text-[13px] truncate font-semibold">Trouvé aujourd&apos;hui</span>
                  </div>
                  <div className="flex items-center text-on-surface-variant gap-1">
                    <span className="material-symbols-outlined text-[16px]">location_on</span>
                    <span className="font-body-md text-[13px] truncate">Gare du Nord</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-2xl p-md soft-shadow mb-lg">
              <h4 className="font-label-md text-[11px] text-on-surface-variant uppercase mb-3">Critères de correspondance</h4>
              <ul className="space-y-3">
                {CRITERIA.map((c) => (
                  <li key={c} className="flex items-center gap-3 text-on-surface">
                    <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                    <span className="font-body-lg text-body-lg">{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        {phase === "no-match" && (
          <>
            <div className="bg-surface-container-lowest rounded-[24px] p-lg soft-shadow mb-lg flex flex-col items-center text-center border border-surface-variant">
              <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mb-md">
                <span className="material-symbols-outlined text-4xl text-outline">search_off</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">Aucune correspondance pour le moment</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">Pas d&apos;inquiétude. Votre recherche peut continuer automatiquement.</p>
            </div>

            <div className="bg-surface-container-lowest rounded-[24px] p-md soft-shadow mb-lg border border-surface-variant flex gap-md items-center">
              <div className="w-16 h-16 rounded-xl bg-surface-container flex items-center justify-center shrink-0 text-primary">
                <span className="material-symbols-outlined text-3xl">{draft.categoryIcon || "inventory_2"}</span>
              </div>
              <div className="flex-1 overflow-hidden">
                <h4 className="font-headline-sm text-headline-sm text-on-surface truncate">{draft.objectName || draft.categoryLabel || "Votre objet"}</h4>
                <p className="font-body-md text-[13px] text-on-surface-variant truncate">
                  {draft.color ? `${draft.color} • ` : ""}Perdu le {draft.date ? new Date(draft.date).toLocaleDateString("fr-FR") : "12 octobre"}
                </p>
                <div className="flex items-center gap-1 mt-1 text-on-surface-variant">
                  <span className="material-symbols-outlined text-[16px]">location_on</span>
                  <span className="font-body-md text-[13px]">{draft.location || "Paris"}</span>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-[24px] p-md soft-shadow mb-lg border border-surface-variant">
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="surveillance-toggle" className="font-headline-sm text-headline-sm text-on-surface">Activer la surveillance</label>
                <button
                  id="surveillance-toggle"
                  type="button"
                  aria-pressed={surveillance}
                  onClick={() => setSurveillance((v) => !v)}
                  className={`w-12 h-6 rounded-full relative transition-colors ${surveillance ? "bg-primary" : "bg-surface-container-highest"}`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${surveillance ? "translate-x-6" : "translate-x-1"}`} />
                </button>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant">Objely continuera à rechercher automatiquement des correspondances.</p>
            </div>
          </>
        )}
      </main>

      {phase === "match" && (
        <div className="fixed bottom-0 left-0 w-full z-50 flex flex-col gap-3 px-container-margin py-md pb-8 bg-surface/80 backdrop-blur-xl shadow-[0_-4px_20px_rgba(0,0,0,0.05)] rounded-t-2xl">
          <Link
            href="/ownership-verification"
            className="w-full h-14 bg-primary btn-gradient text-on-primary rounded-2xl flex items-center justify-center font-headline-sm text-headline-sm hover:opacity-90 active:scale-95 transition-all"
          >
            Voir la correspondance
          </Link>
          <button
            onClick={() => setPhase("no-match")}
            className="w-full h-14 bg-primary-fixed text-primary rounded-2xl flex items-center justify-center font-headline-sm text-headline-sm hover:opacity-90 active:scale-95 transition-all"
          >
            Ce n&apos;est pas mon objet
          </button>
        </div>
      )}

      {phase === "no-match" && (
        <div className="fixed bottom-0 left-0 w-full z-50 flex flex-col gap-2 px-container-margin py-md pb-8 bg-surface/90 backdrop-blur-xl shadow-[0_-4px_20px_rgba(0,0,0,0.05)] rounded-t-2xl">
          <button
            onClick={() => {
              saveDraft({});
              router.push("/report-lost/confirmation");
            }}
            className="w-full h-14 bg-primary btn-gradient text-on-primary font-headline-sm text-headline-sm rounded-2xl flex items-center justify-center hover:opacity-90 transition-opacity"
          >
            Publier mon objet perdu
          </button>
          <Link
            href="/report-lost/details"
            className="w-full h-14 bg-primary-fixed text-primary font-headline-sm text-headline-sm rounded-2xl flex items-center justify-center hover:opacity-90 transition-opacity"
          >
            Modifier ma déclaration
          </Link>
        </div>
      )}
    </div>
  );
}
