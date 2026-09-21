"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import BottomNav from "@/components/BottomNav";
import QrScanner from "@/components/QrScanner";
import { getMyProfile, updateSharePhone } from "@/lib/supabase/profile";
import { listMyItems, type Item } from "@/lib/supabase/items";

const PROFILE_LINK_RE = /\/qr\/u\/([0-9a-f-]{36})/i;
const LOGO_SRC = "/logo/objely-mark.png";

/** Renders the profile QR code onto a canvas, then composites the real Objely mark in the center — errorCorrectionLevel "H" keeps it scannable through the obstruction. */
async function buildQrWithLogo(text: string): Promise<string> {
  const size = 512;
  const canvas = document.createElement("canvas");
  await QRCode.toCanvas(canvas, text, {
    width: size,
    margin: 1,
    errorCorrectionLevel: "H",
    color: { dark: "#0058bc", light: "#ffffff" },
  });
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas.toDataURL("image/png");

  const logo = await new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = LOGO_SRC;
  });
  if (!logo) return canvas.toDataURL("image/png");

  const holeSize = size * 0.24;
  const cx = size / 2;
  const cy = size / 2;
  const r = holeSize / 2;
  const radius = holeSize * 0.3;

  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.moveTo(cx - r + radius, cy - r);
  ctx.arcTo(cx + r, cy - r, cx + r, cy + r, radius);
  ctx.arcTo(cx + r, cy + r, cx - r, cy + r, radius);
  ctx.arcTo(cx - r, cy + r, cx - r, cy - r, radius);
  ctx.arcTo(cx - r, cy - r, cx + r, cy - r, radius);
  ctx.closePath();
  ctx.fill();

  const logoSize = holeSize * 0.7;
  ctx.drawImage(logo, cx - logoSize / 2, cy - logoSize / 2, logoSize, logoSize);

  return canvas.toDataURL("image/png");
}

export default function QrConnectPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"code" | "scan">("code");
  const [userId, setUserId] = useState<string | null>(null);
  const [publicId, setPublicId] = useState<string | null>(null);
  const [loggedOut, setLoggedOut] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [showNumber, setShowNumber] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [myItems, setMyItems] = useState<Item[]>([]);
  const [idCopied, setIdCopied] = useState(false);

  useEffect(() => {
    getMyProfile().then(({ data }) => {
      if (!data) {
        setLoggedOut(true);
        setAuthChecked(true);
        return;
      }
      setUserId(data.id);
      setPublicId(data.public_id);
      setShowNumber(data.share_phone);
      setAuthChecked(true);
    });
    listMyItems().then(({ data }) => setMyItems(data ?? []));
  }, []);

  useEffect(() => {
    if (!userId) return;
    const profileUrl = `${window.location.origin}/qr/u/${userId}`;
    buildQrWithLogo(profileUrl).then(setQrDataUrl);
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

  const handleSaveImage = () => {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = "objely-qr-code.png";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleCopyId = async () => {
    if (!publicId) return;
    try {
      await navigator.clipboard.writeText(publicId);
      setIdCopied(true);
      setTimeout(() => setIdCopied(false), 2000);
    } catch {
      // Clipboard access denied — the chip still displays the id to copy manually.
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

  const itemsLabel =
    myItems.length === 0
      ? null
      : myItems.length === 1
        ? "1 objet protégé lié"
        : `${myItems.length} objets protégés liés`;
  const itemsPreview = myItems
    .slice(0, 3)
    .map((item) => item.title)
    .join(", ");

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
        {!authChecked ? (
          <div className="flex justify-center pt-xl">
            <span className="w-8 h-8 border-4 border-primary-container/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : loggedOut ? (
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
        <div className="bg-surface-container-low rounded-full p-1 flex relative mb-lg shadow-inner">
          <div
            className="absolute inset-y-1 left-1 w-[calc(50%-4px)] bg-surface-container-lowest rounded-full shadow-sm transition-transform duration-300 ease-in-out"
            style={{ transform: mode === "scan" ? "translateX(100%)" : "translateX(0)" }}
          />
          <button
            type="button"
            onClick={() => setMode("code")}
            className={`relative z-10 flex-1 py-2 font-headline-sm text-headline-sm text-center rounded-full transition-colors flex items-center justify-center gap-1.5 ${mode === "code" ? "text-primary" : "text-on-surface-variant"}`}
          >
            <span className="material-symbols-outlined text-[18px]">qr_code_2</span>
            Mon code
          </button>
          <button
            type="button"
            onClick={() => setMode("scan")}
            className={`relative z-10 flex-1 py-2 font-headline-sm text-headline-sm text-center rounded-full transition-colors flex items-center justify-center gap-1.5 ${mode === "scan" ? "text-primary" : "text-on-surface-variant"}`}
          >
            <span className="material-symbols-outlined text-[18px]">qr_code_scanner</span>
            Scanner
          </button>
        </div>

        {mode === "code" ? (
          <div className="flex flex-col gap-lg">
            <section className="bg-surface-container-lowest rounded-xl p-lg soft-shadow flex flex-col items-center text-center">
              <div className="relative p-sm w-full max-w-[260px] aspect-square flex items-center justify-center mb-md">
                <div className="absolute top-0 left-0 w-7 h-7 border-t-[3px] border-l-[3px] border-primary rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-7 h-7 border-t-[3px] border-r-[3px] border-primary rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-7 h-7 border-b-[3px] border-l-[3px] border-primary rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-7 h-7 border-b-[3px] border-r-[3px] border-primary rounded-br-lg" />
                <div className="relative w-full h-full flex items-center justify-center p-md">
                  {qrDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img alt="Mon QR Code" className="w-full h-full object-contain" src={qrDataUrl} />
                  ) : (
                    <div className="w-10 h-10 rounded-full border-4 border-primary-container/30 border-t-primary-container animate-spin" />
                  )}
                </div>
              </div>

              {publicId && (
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-low mb-md active:scale-95 transition-transform"
                >
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="font-label-md text-[11px] text-primary tracking-wide uppercase">{publicId}</span>
                  <span className="material-symbols-outlined text-[14px] text-outline">
                    {idCopied ? "check" : "content_copy"}
                  </span>
                </button>
              )}

              <h2 className="font-headline-md text-headline-md text-on-surface mb-2">Votre QR Code personnel</h2>
              <p className="font-body-md text-body-md text-[13px] text-on-surface-variant max-w-sm">
                Partagez votre QR Code pour permettre à d&apos;autres utilisateurs Objely d&apos;accéder aux informations que vous choisissez de partager.
              </p>
            </section>

            <section>
              <div className="bg-surface-container-lowest rounded-xl soft-shadow overflow-hidden">
                <div className="flex items-center justify-between p-md">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center shrink-0 text-primary">
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

            {itemsLabel && (
              <Link
                href="/search"
                className="bg-surface-container-lowest rounded-xl p-md soft-shadow flex items-center justify-between active:scale-[0.99] transition-transform"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center shrink-0 text-secondary">
                    <span className="material-symbols-outlined text-[20px]">devices_other</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-label-md text-label-md text-on-surface truncate">{itemsLabel}</span>
                    <span className="font-body-md text-body-md text-[13px] text-on-surface-variant truncate">{itemsPreview}</span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-outline text-[20px] shrink-0">chevron_right</span>
              </Link>
            )}

            <section className="flex flex-col gap-sm">
              <button
                type="button"
                onClick={handleShare}
                disabled={!userId}
                className="w-full h-[52px] bg-gradient-to-r from-primary to-secondary text-on-primary rounded-full shadow-[0_8px_24px_-4px_rgba(0,88,188,0.35)] font-headline-sm text-headline-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[20px]">ios_share</span>
                Partager mon QR Code
              </button>
              <button
                type="button"
                onClick={handleSaveImage}
                disabled={!qrDataUrl}
                className="w-full h-11 bg-transparent hover:bg-surface-container text-primary rounded-full active:scale-[0.98] transition-all flex items-center justify-center gap-2 font-label-md text-label-md disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[20px]">download</span>
                Enregistrer l&apos;image
              </button>
              {shareFeedback && (
                <p className="font-body-md text-body-md text-[13px] text-primary text-center">{shareFeedback}</p>
              )}
            </section>
          </div>
        ) : (
          <div className="flex flex-col gap-lg pt-2">
            <QrScanner active={mode === "scan"} onDecode={handleDecode} />
            <div className="text-center px-2">
              <h2 className="font-headline-sm text-headline-sm text-on-surface mb-1">
                Scannez le QR Code d&apos;un utilisateur Objely
              </h2>
              <p className="font-body-md text-body-md text-[13px] text-on-surface-variant max-w-xs mx-auto">
                Vous accédez uniquement aux informations que cette personne a choisi de rendre publiques pour la restitution d&apos;un objet.
              </p>
            </div>
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
