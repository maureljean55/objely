"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loadDraft, saveDraft, type DeclarationDraft } from "@/lib/declarationDraft";

const STATUS_TEXTS = ["Analyse des déclarations...", "Comparaison des informations...", "Recherche de correspondances..."];

const CRITERIA = [
  { icon: "category", label: "Même catégorie" },
  { icon: "palette", label: "Couleur" },
  { icon: "branding_watermark", label: "Marque" },
  { icon: "location_on", label: "Lieu proche" },
  { icon: "calendar_today", label: "Date compatible" },
];

function RadarPulse() {
  return (
    <div className="relative w-24 h-24 mb-md flex items-center justify-center">
      <span className="absolute inset-0 rounded-full bg-primary/20 animate-ping" style={{ animationDuration: "2s" }} />
      <span className="absolute inset-2 rounded-full bg-primary/20 animate-ping" style={{ animationDuration: "2s", animationDelay: "0.5s" }} />
      <span className="relative w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-md">
        <span className="material-symbols-outlined text-on-primary text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>radar</span>
      </span>
    </div>
  );
}

export default function ReportFoundMatchesPage() {
  const router = useRouter();
  const [draft, setDraft] = useState<DeclarationDraft>({});
  const [phase, setPhase] = useState<"checking" | "match" | "no-match">("checking");
  const [statusIndex, setStatusIndex] = useState(0);

  useEffect(() => {
    const d = loadDraft();
    // sessionStorage is only readable client-side, so this can't happen
    // during render without risking an SSR/hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraft(d);
    const hasMatch = d.categoryId === "wallet";
    const timer = setTimeout(() => setPhase(hasMatch ? "match" : "no-match"), 2600);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (phase !== "checking") return;
    const id = setInterval(() => setStatusIndex((i) => (i + 1) % STATUS_TEXTS.length), 1300);
    return () => clearInterval(id);
  }, [phase]);

  return (
    <div className="bg-background text-on-background antialiased min-h-screen flex flex-col font-body-md">
      <header className="bg-surface/80 backdrop-blur-xl sticky top-0 flex items-center justify-between px-container-margin h-16 w-full z-50">
        <Link href="/report-found/location" aria-label="Retour" className="p-2 -ml-2 text-primary hover:opacity-70 transition-opacity active:scale-95">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <h1 className="font-headline-sm text-headline-sm text-on-surface truncate px-4">Déclarer un objet</h1>
        <span className="font-body-md text-body-md text-[13px] text-on-surface-variant w-10 text-right">4/4</span>
      </header>

      <main className="grow px-container-margin pt-lg pb-[200px] max-w-2xl mx-auto w-full">
        <div className="flex flex-col items-center text-center mb-lg">
          <RadarPulse />
          {phase === "checking" && (
            <span className="font-label-md text-label-md text-primary uppercase tracking-wider mb-2">{STATUS_TEXTS[statusIndex]}</span>
          )}
          <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-2">Vérifions si quelqu&apos;un le recherche</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-sm">
            Objely recherche les déclarations d&apos;objets perdus qui pourraient correspondre à votre découverte.
          </p>
        </div>

        <div className="flex gap-1 mb-lg">
          <div className="h-1 flex-1 rounded-full bg-primary-container" />
          <div className="h-1 flex-1 rounded-full bg-primary-container" />
          <div className="h-1 flex-1 rounded-full bg-primary-container" />
          <div className={`h-1 flex-1 rounded-full ${phase === "checking" ? "progress-gradient" : "bg-primary-container"}`} />
        </div>

        {phase === "match" && (
          <>
            <div className="bg-surface-container-lowest rounded-2xl soft-shadow overflow-hidden mb-lg">
              <div className="px-md py-md bg-surface-container-low border-b border-surface-variant flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                  <span className="font-headline-sm text-headline-sm text-on-surface">Correspondance possible</span>
                </div>
                <span className="font-label-md text-[11px] text-secondary bg-secondary/10 px-2 py-1 rounded-md uppercase">96% de correspondance</span>
              </div>

              <div className="p-md grid grid-cols-2 gap-md relative">
                <div className="absolute left-1/2 top-md bottom-md w-px bg-outline-variant -translate-x-1/2" />
                <div className="flex flex-col items-center text-center">
                  <span className="font-label-md text-[11px] text-on-surface-variant uppercase mb-2">Objet trouvé (vous)</span>
                  <div className="w-24 h-24 rounded-xl overflow-hidden mb-2 bg-surface-container-high border border-outline-variant/30">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt="Votre objet trouvé"
                      className="w-full h-full object-cover"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuC0soK0sW8aPoWV6WfFWvnU6nGdzk-4TLRlhGhts72MsmLLH0DTx8tJeWFp-GcAyGyRjHVkbB7iWl3JJU3MEbk-oGoFa3b6ZhfbOaV6de7AelVUI8KcmGtmG5jStSIbNbWjZwqL_FA_itivt1AHfAz5dy_e78AYOv27eddwpdXjd-6m4kmF31OTKNvlowDoRZX4ljRYsYlzt75zX2iX-IMj08H9C60J4696rqUfIFaTFTKNR1vDWseXeA"
                    />
                  </div>
                  <span className="font-body-md text-body-md text-on-surface">{draft.objectName || "Portefeuille noir"}</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <span className="font-label-md text-[11px] text-on-surface-variant uppercase mb-2">Déclaration de perte</span>
                  <div className="w-24 h-24 rounded-xl overflow-hidden mb-2 bg-surface-container-high border border-outline-variant/30">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt="Objet déclaré perdu"
                      className="w-full h-full object-cover"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBVh_GHeUQtXLh5Y-1muIpdkNspE6VWG6RpnNMDmsBkAayeb_lvNjvKxm1uhUwBk6PqMWrwv7PsbD-_DZUPXMfKfTw4UUj3wBIkw0-U7saUTl9jNjk0srOwkacepzvqEKqTKzxkJAfKhDJ0bwUGqmzQW-kj57JfisPXKvBX9Iw51_VKT1w_kDCE7IVbEk-_KSS0dWDetFYtINKqTBFYbzMjG789Kei11sGFNUm_oHEPAovyW_xpE-C33A"
                    />
                  </div>
                  <span className="font-body-md text-body-md text-on-surface">Portefeuille en cuir noir</span>
                </div>
              </div>

              <div className="px-md py-md border-t border-surface-variant bg-surface-container-low">
                <span className="font-label-md text-[11px] text-on-surface-variant uppercase block mb-2">Critères validés</span>
                <div className="flex flex-wrap gap-2">
                  {CRITERIA.map((c) => (
                    <div key={c.label} className="flex items-center gap-1 bg-surface-container-lowest border border-outline-variant/40 px-2 py-1 rounded-md">
                      <span className="material-symbols-outlined text-[16px] text-primary">{c.icon}</span>
                      <span className="font-label-md text-[11px] text-on-surface">{c.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {phase === "no-match" && (
          <div className="bg-surface-container-lowest rounded-2xl p-lg soft-shadow flex flex-col items-center text-center border border-surface-variant">
            <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mb-md">
              <span className="material-symbols-outlined text-4xl text-outline">search_off</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">Personne ne recherche cet objet pour l&apos;instant</h3>
            <p className="font-body-md text-body-md text-on-surface-variant">Publiez votre découverte : nous vous préviendrons dès qu&apos;une déclaration correspondante apparaît.</p>
          </div>
        )}
      </main>

      {phase === "match" && (
        <div className="fixed bottom-0 left-0 w-full z-50 flex flex-col gap-3 px-container-margin py-md pb-8 bg-surface/80 backdrop-blur-xl shadow-[0_-4px_20px_rgba(0,0,0,0.05)] rounded-t-2xl">
          <Link
            href="/activity/verification"
            className="w-full h-14 bg-primary btn-gradient text-on-primary rounded-2xl flex items-center justify-center gap-2 font-headline-sm text-headline-sm hover:opacity-90 active:scale-95 transition-all"
          >
            Voir la correspondance
            <span className="material-symbols-outlined text-[20px]">visibility</span>
          </Link>
          <button
            onClick={() => setPhase("no-match")}
            className="w-full h-14 bg-primary-fixed text-primary rounded-2xl flex items-center justify-center font-headline-sm text-headline-sm hover:opacity-90 active:scale-95 transition-all"
          >
            Ce n&apos;est pas le même objet
          </button>
        </div>
      )}

      {phase === "no-match" && (
        <div className="fixed bottom-0 left-0 w-full z-50 flex flex-col gap-2 px-container-margin py-md pb-8 bg-surface/90 backdrop-blur-xl shadow-[0_-4px_20px_rgba(0,0,0,0.05)] rounded-t-2xl">
          <button
            onClick={() => {
              saveDraft({});
              router.push("/report-found/confirmation");
            }}
            className="w-full h-14 bg-primary btn-gradient text-on-primary font-headline-sm text-headline-sm rounded-2xl flex items-center justify-center hover:opacity-90 transition-opacity"
          >
            Publier mon objet trouvé
          </button>
          <Link
            href="/report-found/details"
            className="w-full h-14 bg-primary-fixed text-primary font-headline-sm text-headline-sm rounded-2xl flex items-center justify-center hover:opacity-90 transition-opacity"
          >
            Modifier ma déclaration
          </Link>
        </div>
      )}
    </div>
  );
}
