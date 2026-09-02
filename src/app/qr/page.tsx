"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";

const QR_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCMiNq4A6ucfOXFrKoq7g8mR8l8YkxDvlmOUoVN5mgjIrxih8TyYFy65j3c7wHHkKW604B3Pdul5vvv2mfksFjKEUSEpF9nG4HvaaPpSKS3JAhA6yHY5iqUeWfR13T5WAbZF91rXX--ziIbyz3jKlcH-otXSMJBH7h2LRzTViORqO6h96-2nJHqfFvGis_rJr5sK5YvVHH4CWcYXCl374XXBAKkqAfcA928q1zRHz7ubdHeRHplBjmE";

export default function QrConnectPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"code" | "scan">("code");
  const [showNumber, setShowNumber] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <div className="bg-background text-on-background font-body-md antialiased min-h-screen pb-28 md:pb-12">
      <header className="glass-header fixed top-0 inset-x-0 z-50 flex items-center justify-between px-container-margin h-16 w-full shadow-[0_1px_0_rgba(0,0,0,0.05)]">
        <button type="button" onClick={() => router.back()} aria-label="Retour" className="w-10 h-10 flex items-center justify-center rounded-full text-primary hover:bg-surface-container-high/50 transition-colors -ml-2">
          <span className="material-symbols-outlined">arrow_back_ios</span>
        </button>
        <h1 className="font-headline-sm text-headline-sm text-primary">Mon QR Code</h1>
        <div className="w-10 h-10" />
      </header>

      <main className="pt-[88px] px-container-margin max-w-md mx-auto">
        <div className="bg-surface-container-low rounded-full p-1 flex relative mb-lg">
          <div
            className="absolute inset-y-1 left-1 w-[calc(50%-4px)] bg-surface-container-lowest rounded-full shadow-sm transition-transform duration-300 ease-in-out"
            style={{ transform: mode === "scan" ? "translateX(100%)" : "translateX(0)" }}
          />
          <button
            type="button"
            onClick={() => setMode("code")}
            className={`relative z-10 flex-1 py-2 font-headline-sm text-headline-sm text-center rounded-full transition-colors ${mode === "code" ? "text-primary" : "text-on-surface-variant"}`}
          >
            Mon code
          </button>
          <button
            type="button"
            onClick={() => setMode("scan")}
            className={`relative z-10 flex-1 py-2 font-headline-sm text-headline-sm text-center rounded-full transition-colors ${mode === "scan" ? "text-primary" : "text-on-surface-variant"}`}
          >
            Scanner
          </button>
        </div>

        {mode === "code" ? (
          <div className="flex flex-col gap-lg">
            <section className="flex flex-col items-center text-center pt-2">
              <div className="bg-surface-container-lowest p-lg rounded-2xl soft-shadow w-64 h-64 mb-lg flex items-center justify-center overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img alt="Mon QR Code" className="w-full h-full object-contain" src={QR_IMAGE} />
              </div>
              <h2 className="font-headline-md text-headline-md text-on-surface mb-2">Votre QR Code personnel</h2>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-sm">
                Toute personne qui scanne ce code pourra voir les informations que vous avez choisi de partager.
              </p>
            </section>

            <section>
              <div className="bg-surface-container-lowest rounded-xl soft-shadow overflow-hidden">
                <div className="flex items-center justify-between p-md">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary-container/10 flex items-center justify-center shrink-0 mt-0.5 text-primary-container">
                      <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>phone</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-body-md text-body-md text-on-surface font-semibold mb-0.5">Afficher mon numéro</span>
                      <span className="font-body-md text-body-md text-[13px] text-on-surface-variant">
                        Autoriser l&apos;affichage de mon numéro lorsqu&apos;une personne scanne mon QR Code.
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={showNumber}
                    onClick={() => (showNumber ? setShowNumber(false) : setConfirmOpen(true))}
                    className="shrink-0 ml-3"
                  >
                    <span
                      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                        showNumber ? "bg-primary" : "bg-surface-container-highest"
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
                          showNumber ? "translate-x-5" : "translate-x-0.5"
                        }`}
                      />
                    </span>
                  </button>
                </div>
              </div>
              <p className="font-label-md text-[11px] text-on-surface-variant mt-2 ml-3">
                {showNumber ? "Votre numéro est visible par les personnes qui scannent votre code." : "Votre numéro reste privé."}
              </p>
            </section>

            <section className="flex flex-col gap-sm">
              <button
                type="button"
                className="w-full h-12 bg-primary text-on-primary rounded-xl font-headline-sm text-headline-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
              >
                <span className="material-symbols-outlined text-[20px]">ios_share</span>
                Partager mon QR Code
              </button>
              <button
                type="button"
                className="w-full h-12 bg-primary/5 text-primary rounded-xl font-headline-sm text-headline-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
              >
                <span className="material-symbols-outlined text-[20px]">download</span>
                Enregistrer le QR Code
              </button>
              <button type="button" className="w-full mt-1 text-primary font-body-md text-body-md py-2 active:opacity-60 transition-opacity">
                Régénérer mon QR Code
              </button>
            </section>
          </div>
        ) : (
          <div className="flex flex-col gap-lg pt-2">
            <div className="aspect-square w-full rounded-2xl border-2 border-dashed border-outline-variant bg-surface-container-low flex flex-col items-center justify-center gap-3 text-center px-lg">
              <span className="material-symbols-outlined text-primary text-[56px]">qr_code_scanner</span>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-xs">
                Pointez votre caméra vers un QR Code Objely pour vous connecter instantanément.
              </p>
            </div>

            <section>
              <h3 className="font-label-md text-[11px] text-outline uppercase tracking-wider mb-2">Exemples de résultats</h3>
              <div className="flex flex-col gap-sm">
                <Link
                  href="/qr/scan/visible"
                  className="bg-surface-container-lowest rounded-xl soft-shadow p-md flex items-center gap-3 hover:bg-surface-container-low transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px]">lock_open</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-body-md text-body-md text-on-surface font-semibold">Numéro visible</p>
                    <p className="font-body-md text-body-md text-[13px] text-on-surface-variant">Le profil a choisi de partager son numéro.</p>
                  </div>
                  <span className="material-symbols-outlined text-outline-variant">chevron_right</span>
                </Link>
                <Link
                  href="/qr/scan/private"
                  className="bg-surface-container-lowest rounded-xl soft-shadow p-md flex items-center gap-3 hover:bg-surface-container-low transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px]">lock</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-body-md text-body-md text-on-surface font-semibold">Numéro privé</p>
                    <p className="font-body-md text-body-md text-[13px] text-on-surface-variant">Le profil garde son numéro masqué.</p>
                  </div>
                  <span className="material-symbols-outlined text-outline-variant">chevron_right</span>
                </Link>
              </div>
            </section>
          </div>
        )}
      </main>

      {confirmOpen && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
          <div className="bg-surface-container-lowest w-[280px] rounded-xl overflow-hidden shadow-xl">
            <div className="pt-lg pb-md px-md text-center border-b border-surface-variant/50">
              <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">Afficher votre numéro ?</h3>
              <p className="font-body-md text-body-md text-[13px] text-on-surface-variant leading-tight">
                Votre numéro de téléphone pourra être consulté par toute personne qui scanne votre QR Code. Vous pouvez désactiver cette option à tout moment.
              </p>
            </div>
            <div className="flex flex-col w-full">
              <button
                type="button"
                onClick={() => {
                  setShowNumber(true);
                  setConfirmOpen(false);
                }}
                className="w-full py-3 text-center border-b border-surface-variant/50 text-primary font-headline-sm text-headline-sm active:bg-surface-variant/50 transition-colors"
              >
                Autoriser
              </button>
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="w-full py-3 text-center text-primary font-body-md text-body-md active:bg-surface-variant/50 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav active="home" />
    </div>
  );
}
