"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { getMatch, type MatchWithItems } from "@/lib/supabase/messages";
import { submitVerificationAnswers } from "@/lib/supabase/verification";

function OwnershipVerificationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const matchId = searchParams.get("match");

  const [match, setMatch] = useState<MatchWithItems | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [brand, setBrand] = useState("");
  const [detail, setDetail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!matchId) return;
    getMatch(matchId).then(({ data, error }) => {
      if (error || !data) {
        setLoadError(true);
        return;
      }
      setMatch(data);
    });
  }, [matchId]);

  const handleSubmit = async () => {
    if (!matchId) return;
    setIsSubmitting(true);
    setSubmitError(null);
    const { error } = await submitVerificationAnswers(matchId, brand, detail);
    if (error) {
      setSubmitError("Une erreur est survenue, réessayez.");
      setIsSubmitting(false);
      return;
    }
    setSubmitted(true);
  };

  if (loadError || !matchId) {
    return (
      <div className="bg-background text-on-surface antialiased min-h-screen flex flex-col items-center justify-center px-container-margin text-center">
        <p className="font-body-md text-body-md text-on-surface-variant">Correspondance introuvable.</p>
        <button type="button" onClick={() => router.push("/home")} className="text-primary font-semibold mt-4">
          Retour à l&apos;accueil
        </button>
      </div>
    );
  }

  if (match && match.status !== "pending" && !submitted) {
    return (
      <div className="bg-background text-on-surface antialiased min-h-screen flex flex-col items-center justify-center px-container-margin text-center gap-3">
        <p className="font-body-md text-body-md text-on-surface-variant max-w-sm">
          {match.status === "confirmed"
            ? "Cette correspondance a déjà été confirmée."
            : "Cette correspondance a déjà été refusée."}
        </p>
        <button type="button" onClick={() => router.push("/activity")} className="text-primary font-semibold mt-2">
          Retour à l&apos;activité
        </button>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="bg-background text-on-surface antialiased min-h-screen flex flex-col items-center justify-center px-container-margin text-center gap-3">
        <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2">
          <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>mark_email_read</span>
        </div>
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">Vérification envoyée</h1>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-sm">
          Vous recevrez une notification si le trouveur confirme que les informations sont correctes. Si elles le sont, vous aurez le droit d&apos;écrire à la personne qui a trouvé votre objet.
        </p>
        <button type="button" onClick={() => router.push("/activity")} className="text-primary font-semibold mt-2">
          Retour à l&apos;activité
        </button>
      </div>
    );
  }

  const foundItem = match?.found_item;

  return (
    <div className="bg-background text-on-surface antialiased min-h-screen flex flex-col pb-24 md:pb-0">
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md shadow-sm">
        <div
          className="flex items-center justify-between px-container-margin pb-sm w-full max-w-full mx-auto md:max-w-[1140px]"
          style={{ paddingTop: "calc(0.75rem + env(safe-area-inset-top))" }}
        >
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Retour"
            className="w-10 h-10 flex items-center justify-center rounded-full hover:opacity-80 transition-opacity active:scale-95 text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>arrow_back</span>
          </button>
          <h1 className="font-display text-headline-sm font-bold text-on-surface flex-1 text-center truncate px-2">Vérification</h1>
          <div className="w-10 h-10" />
        </div>
      </header>

      <main className="flex-1 w-full max-w-[1140px] mx-auto pt-[calc(6rem+env(safe-area-inset-top))] px-container-margin md:px-xl pb-32">
        <div className="mb-xl text-center md:text-left max-w-2xl mx-auto md:mx-0">
          <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-sm">
            Prouvez que cet objet vous appartient
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Répondez à quelques questions pour confirmer que vous êtes bien le propriétaire de cet objet.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-xl">
          <div className="md:col-span-5 md:col-start-1 flex flex-col gap-lg">
            {foundItem && (
              <div className="bg-surface-container-lowest rounded-xl soft-shadow inner-stroke overflow-hidden flex flex-col">
                <div className="relative h-48 w-full bg-surface-container-high flex items-center justify-center text-primary">
                  {foundItem.photos?.[0] ? (
                    <Image
                      alt="Objet trouvé (photo floutée)"
                      src={foundItem.photos[0]}
                      fill
                      sizes="(max-width: 768px) 100vw, 480px"
                      className="object-cover filter blur-sm scale-110 opacity-90 transition-all duration-500 hover:blur-md"
                    />
                  ) : (
                    <span className="material-symbols-outlined text-6xl opacity-60">{foundItem.category_icon || "inventory_2"}</span>
                  )}
                  <div className="absolute top-md right-md bg-surface-container-lowest/90 backdrop-blur-md px-3 py-1 rounded-full border border-surface-variant flex items-center gap-2 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse" />
                    <span className="font-label-md text-label-md text-on-surface">
                      Trouvé le {new Date(foundItem.created_at).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                </div>
                <div className="p-md flex items-center justify-between bg-surface-container-lowest">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary-fixed/30 flex items-center justify-center text-on-secondary-fixed">
                      <span className="material-symbols-outlined text-[20px]">{foundItem.category_icon || "inventory_2"}</span>
                    </div>
                    <div>
                      <h3 className="font-headline-sm text-headline-sm text-on-surface">{foundItem.title}</h3>
                      <p className="font-body-md text-body-md text-on-surface-variant text-sm">{foundItem.location || "Lieu non précisé"}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-surface-container-low rounded-xl p-md flex items-start gap-md border border-surface-variant/50">
              <div className="mt-1 shrink-0 text-primary-container">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                <strong className="text-on-surface font-semibold">Vos informations restent privées.</strong> Ces réponses ne sont visibles que par le trouveur pour valider la restitution.
              </p>
            </div>
          </div>

          <div className="md:col-span-7 md:col-start-6">
            <form
              className="flex flex-col gap-lg bg-surface-container-lowest rounded-[32px] p-lg md:p-xl soft-shadow inner-stroke"
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="h-1 w-12 rounded-full progress-gradient" />
                <div className="h-1 w-12 rounded-full bg-surface-variant" />
                <span className="font-label-md text-label-md text-on-surface-variant ml-2">Étape 1 sur 2</span>
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-headline-sm text-headline-sm text-on-surface" htmlFor="q-brand">
                  Quelle est la marque ou le logo présent sur l&apos;objet ?
                </label>
                <p className="font-body-md text-body-md text-on-surface-variant text-sm mb-1">
                  Soyez précis si possible (ex: logo en métal doré, marque embossée à l&apos;intérieur).
                </p>
                <input
                  className="w-full h-14 bg-surface-container-low border-transparent rounded-[16px] px-md font-body-lg text-body-lg text-on-surface focus:border-primary-container focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary-container transition-all placeholder:text-outline-variant"
                  id="q-brand"
                  name="brand"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="Ex: Montblanc, Le Tanneur..."
                  type="text"
                />
              </div>

              <hr className="border-surface-variant/50" />

              <div className="flex flex-col gap-2">
                <label className="font-headline-sm text-headline-sm text-on-surface" htmlFor="q-details">
                  Quel détail particulier ou contenu se trouve à l&apos;intérieur ?
                </label>
                <p className="font-body-md text-body-md text-on-surface-variant text-sm mb-1">
                  Décrivez un élément unique (une carte spécifique, une photo, une griffe).
                </p>
                <textarea
                  className="w-full bg-surface-container-low border-transparent rounded-[16px] p-md font-body-lg text-body-lg text-on-surface focus:border-primary-container focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary-container transition-all placeholder:text-outline-variant resize-none"
                  id="q-details"
                  name="details"
                  value={detail}
                  onChange={(e) => setDetail(e.target.value)}
                  placeholder="Ex: Il y a une carte de fidélité Monoprix rouge, et une vieille photo d'identité pliée dans la pochette gauche..."
                  rows={4}
                />
              </div>

              {submitError && (
                <p className="font-body-md text-[13px] text-error bg-error-container/40 rounded-xl px-4 py-2 text-center">{submitError}</p>
              )}

              <div className="pt-sm flex flex-col sm:flex-row-reverse gap-sm mt-md">
                <button
                  type="submit"
                  disabled={isSubmitting || !matchId}
                  className="btn-primary-gradient min-h-[56px] px-lg rounded-[16px] flex-1 flex items-center justify-center gap-2 text-on-primary font-headline-sm text-headline-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-md shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Envoi…" : "Envoyer la vérification"}
                  {!isSubmitting && <span className="material-symbols-outlined text-[20px]">arrow_forward</span>}
                </button>
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="min-h-[56px] px-lg rounded-[16px] sm:w-auto bg-transparent border-none text-primary-container font-headline-sm text-headline-sm hover:bg-surface-container-high/50 active:scale-[0.98] transition-all flex items-center justify-center"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function OwnershipVerificationPage() {
  return (
    <Suspense>
      <OwnershipVerificationContent />
    </Suspense>
  );
}
