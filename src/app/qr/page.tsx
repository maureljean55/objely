"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import BottomNav from "@/components/BottomNav";
import QrScanner from "@/components/QrScanner";
import { getMyProfile, updateSharePhone } from "@/lib/supabase/profile";

const PROFILE_LINK_RE = /\/qr\/u\/([0-9a-f-]{36})/i;

export default function QrConnectPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"code" | "scan">("code");
  const [userId, setUserId] = useState<string | null>(null);
  const [loggedOut, setLoggedOut] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [showNumber, setShowNumber] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  useEffect(() => {
    getMyProfile().then(({ data }) => {
      if (!data) {
        setLoggedOut(true);
        return;
      }
      setUserId(data.id);
      setShowNumber(data.share_phone);
    });
  }, []);

  useEffect(() => {
    if (!userId) return;
    const profileUrl = `${window.location.origin}/qr/u/${userId}`;
    QRCode.toDataURL(profileUrl, { width: 512, margin: 1 }).then(setQrDataUrl);
  }, [userId]);

  const toggleShowNumber = async (next: boolean) => {
    setShowNumber(next);
    await updateSharePhone(next);
  };

  const handleShare = async () => {
    if (!userId) return;
    const profileUrl = `${window.location.origin}/qr/u/${userId}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Mon QR Code Objely", url: profileUrl });
      } catch {
        // User cancelled the share sheet — nothing to do.
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(profileUrl);
      setShareFeedback("Lien copié dans le presse-papiers");
      setTimeout(() => setShareFeedback(null), 2500);
    } catch {
      setShareFeedback("Impossible de copier le lien");
      setTimeout(() => setShareFeedback(null), 2500);
    }
  };

  const handleDecode = (text: string) => {
    const match = text.match(PROFILE_LINK_RE);
    if (!match) {
      setScanError("Ce QR Code n'est pas un QR Code Objely.");
      setTimeout(() => setScanError(null), 3000);
      return;
    }
    router.push(`/qr/u/${match[1]}`);
  };

  return (
    <div className="bg-background text-on-background font-body-md antialiased min-h-screen pb-28 md:pb-12">
      <header className="glass-header fixed top-0 inset-x-0 z-50 flex items-center justify-between px-container-margin min-h-16 pt-[env(safe-area-inset-top)] w-full shadow-[0_1px_0_rgba(0,0,0,0.05)]">
        <button type="button" onClick={() => router.back()} aria-label="Retour" className="w-10 h-10 flex items-center justify-center rounded-full text-primary hover:bg-surface-container-high/50 transition-colors -ml-2">
          <span className="material-symbols-outlined">arrow_back_ios</span>
        </button>
        <h1 className="font-headline-sm text-headline-sm text-primary">Mon QR Code</h1>
        <div className="w-10 h-10" />
      </header>

      <main className="pt-[calc(88px+env(safe-area-inset-top))] px-container-margin max-w-md mx-auto">
        {loggedOut ? (
          <div className="flex flex-col items-center text-center gap-md pt-xl">
            <span className="material-symbols-outlined text-primary text-[56px]">qr_code_2</span>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-xs">
              Connectez-vous pour accéder à votre QR Code personnel.
            </p>
            <Link href="/login" className="mt-2 bg-primary text-on-primary rounded-xl px-6 py-3 font-headline-sm text-headline-sm">
              Se connecter
            </Link>
          </div>
        ) : (
        <>
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
                {qrDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img alt="Mon QR Code" className="w-full h-full object-contain" src={qrDataUrl} />
                ) : (
                  <div className="w-10 h-10 rounded-full border-4 border-primary-container/30 border-t-primary-container animate-spin" />
                )}
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
                    onClick={() => (showNumber ? toggleShowNumber(false) : setConfirmOpen(true))}
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
                onClick={handleShare}
                disabled={!userId}
                className="w-full h-12 bg-primary text-on-primary rounded-xl font-headline-sm text-headline-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[20px]">ios_share</span>
                Partager mon QR Code
              </button>
              {shareFeedback && (
                <p className="font-body-md text-body-md text-[13px] text-primary text-center">{shareFeedback}</p>
              )}
            </section>
          </div>
        ) : (
          <div className="flex flex-col gap-lg pt-2">
            <QrScanner active={mode === "scan"} onDecode={handleDecode} />
            <p className="font-body-md text-body-md text-on-surface-variant max-w-xs text-center mx-auto">
              Pointez votre caméra vers le QR Code d&apos;un autre utilisateur Objely.
            </p>
            {scanError && (
              <p className="font-body-md text-body-md text-[13px] text-error bg-error-container/40 rounded-xl px-4 py-2 text-center">
                {scanError}
              </p>
            )}
          </div>
        )}
        </>
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
                  toggleShowNumber(true);
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
