"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import BottomNav from "@/components/BottomNav";
import {
  getMyIdentityVerification,
  submitIdentityVerification,
  type IdentityVerification,
} from "@/lib/supabase/identityVerification";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

export default function IdentityVerificationPage() {
  const [verification, setVerification] = useState<IdentityVerification | null>(null);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getMyIdentityVerification().then(({ data }) => {
      setVerification(data);
      setLoading(false);
    });
  }, []);

  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] ?? null);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!file || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);

    const { error: submitError } = await submitIdentityVerification(file);
    setIsSubmitting(false);

    if (submitError) {
      setError("Une erreur est survenue, réessayez.");
      return;
    }

    setSubmitted(true);
  };

  return (
    <div className="bg-background text-on-surface antialiased min-h-screen pb-32">
      <header className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-container-margin min-h-14 pt-[env(safe-area-inset-top)] bg-surface/80 backdrop-blur-xl border-b border-outline-variant/30">
        <Link href="/profile" aria-label="Retour" className="p-2 -ml-2 text-primary hover:opacity-70 transition-opacity active:scale-95 flex items-center justify-center">
          <span className="material-symbols-outlined">arrow_back_ios</span>
        </Link>
        <h1 className="font-headline-sm text-headline-sm text-on-surface">Vérification d&apos;identité</h1>
        <div className="w-10" />
      </header>

      <main className="pt-[calc(5rem+env(safe-area-inset-top))] px-container-margin max-w-2xl mx-auto pb-8">
        {loading ? (
          <div className="flex justify-center py-xl">
            <span className="w-8 h-8 border-4 border-primary-container/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : submitted || verification?.status === "pending" ? (
          <div className="flex flex-col items-center text-center py-xl">
            <div className="w-16 h-16 rounded-full bg-primary-fixed flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-primary text-[32px]">hourglass_top</span>
            </div>
            <h2 className="font-headline-md text-headline-md text-on-surface mb-2">Document en cours de vérification</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mb-lg max-w-sm">
              Notre équipe examine votre document. Vous recevrez le badge &laquo;&nbsp;Identité vérifiée&nbsp;&raquo; dès que ce sera validé.
            </p>
            <Link href="/profile" className="bg-primary text-on-primary py-3 px-8 rounded-full font-body-lg text-body-lg font-semibold hover:opacity-90 transition-opacity">
              Retour au profil
            </Link>
          </div>
        ) : verification?.status === "approved" ? (
          <div className="flex flex-col items-center text-center py-xl">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-emerald-600 text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            </div>
            <h2 className="font-headline-md text-headline-md text-on-surface mb-2">Identité vérifiée</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mb-lg max-w-sm">
              Votre identité a été confirmée le {formatDate(verification.reviewed_at ?? verification.created_at)}. Le badge est visible sur votre profil.
            </p>
            <Link href="/profile" className="bg-primary text-on-primary py-3 px-8 rounded-full font-body-lg text-body-lg font-semibold hover:opacity-90 transition-opacity">
              Retour au profil
            </Link>
          </div>
        ) : (
          <>
            {verification?.status === "rejected" && (
              <div className="bg-error-container/40 rounded-xl px-4 py-3 mb-lg">
                <p className="font-body-md text-body-md text-error font-semibold mb-1">Document refusé</p>
                <p className="font-body-md text-body-md text-error">
                  {verification.rejection_reason || "Le document soumis n'a pas pu être validé."} Vous pouvez en soumettre un nouveau.
                </p>
              </div>
            )}

            <p className="font-body-lg text-body-lg text-on-surface-variant mb-8">
              Ajoutez une photo lisible d&apos;une pièce d&apos;identité (carte d&apos;identité, passeport ou permis de conduire) pour obtenir le badge
              &laquo;&nbsp;Identité vérifiée&nbsp;&raquo; et renforcer la confiance des autres utilisateurs. Le document reste privé et n&apos;est visible que par notre équipe de modération.
            </p>

            <div className="flex flex-col gap-lg">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {previewUrl ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-surface-container-lowest shadow-sm"
                >
                  <Image alt="Aperçu du document" src={previewUrl} fill className="object-contain" unoptimized />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full aspect-[4/3] rounded-xl border-2 border-dashed border-outline-variant flex flex-col items-center justify-center gap-2 text-on-surface-variant hover:border-primary hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-[36px]">add_a_photo</span>
                  <span className="font-body-md text-body-md">Ajouter une photo du document</span>
                </button>
              )}

              {error && <p className="font-body-md text-body-md text-error bg-error-container/40 rounded-xl px-4 py-3">{error}</p>}

              <button
                type="button"
                onClick={handleSubmit}
                disabled={!file || isSubmitting}
                className="btn-primary-gradient w-full bg-primary text-on-primary font-headline-sm text-headline-sm py-4 rounded-full shadow-[0_4px_14px_rgba(0,88,188,0.3)] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Envoi…" : "Envoyer pour vérification"}
              </button>
            </div>
          </>
        )}
      </main>

      <BottomNav active="profile" />
    </div>
  );
}
