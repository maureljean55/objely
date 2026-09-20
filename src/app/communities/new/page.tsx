"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { createCommunity, uploadCommunityCoverPhoto } from "@/lib/supabase/communities";
import PhotoPicker from "@/components/PhotoPicker";

export default function NewCommunityPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [villeQuartier, setVilleQuartier] = useState("");
  const [cover, setCover] = useState<string[]>([]);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [allowMemberInvites, setAllowMemberInvites] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCurrentUser().then((user) => {
      if (!user) {
        router.replace("/login?next=/communities/new");
        return;
      }
      setCheckingAuth(false);
    });
  }, [router]);

  const canSubmit = name.trim().length >= 3 && !isUploadingCover && !isSubmitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    setError(null);

    const { data: id, error: createError } = await createCommunity({
      name: name.trim(),
      description: description.trim() || undefined,
      villeQuartier: villeQuartier.trim() || undefined,
      coverUrl: cover[0],
      isPrivate,
      allowMemberInvites,
    });

    if (createError || !id) {
      setError("Impossible de créer la communauté, réessayez.");
      setIsSubmitting(false);
      return;
    }

    router.push(`/communities/${id}`);
  };

  if (checkingAuth) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <span className="w-8 h-8 border-4 border-primary-container/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="font-body-md text-on-surface antialiased min-h-screen flex flex-col bg-background">
      <header
        className="w-full px-container-margin pb-base flex items-center justify-between sticky top-0 z-50 bg-background/80 backdrop-blur-md"
        style={{ paddingTop: "calc(0.5rem + env(safe-area-inset-top))" }}
      >
        <Link
          href="/communities"
          aria-label="Retour"
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high/50 transition-colors"
        >
          <span className="material-symbols-outlined text-on-surface-variant">arrow_back</span>
        </Link>
        <div className="font-headline-sm text-headline-sm text-on-surface">Créer une communauté</div>
        <div className="w-10 h-10" />
      </header>

      <main className="grow w-full max-w-2xl mx-auto px-container-margin pt-md pb-40 flex flex-col">
        <div className="mb-xl">
          <h1 className="font-headline-md text-headline-md text-on-surface mb-2">Rassemblez des déclarants</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Créez un espace pour échanger, vous entraider et coordonner les recherches près de chez vous.
          </p>
        </div>

        <div className="mb-lg">
          <label className="block font-label-md text-label-md text-outline uppercase tracking-wider mb-2">Photo de couverture (optionnel)</label>
          <PhotoPicker photos={cover} onChange={setCover} onUploadingChange={setIsUploadingCover} max={1} uploadFn={uploadCommunityCoverPhoto} />
        </div>

        <form className="flex flex-col gap-lg" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="block font-label-md text-label-md text-outline uppercase tracking-wider mb-2" htmlFor="community-name">
              Nom de la communauté
            </label>
            <input
              id="community-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Déclarants du 11e arrondissement"
              maxLength={60}
              className="w-full bg-surface-container-lowest border border-surface-container-highest rounded-[16px] px-4 py-4 font-body-lg text-body-lg text-on-surface soft-shadow focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          <div>
            <label className="block font-label-md text-label-md text-outline uppercase tracking-wider mb-2" htmlFor="community-city">
              Ville / quartier (optionnel)
            </label>
            <input
              id="community-city"
              value={villeQuartier}
              onChange={(e) => setVilleQuartier(e.target.value)}
              placeholder="Ex: Lyon, quartier Part-Dieu"
              maxLength={80}
              className="w-full bg-surface-container-lowest border border-surface-container-highest rounded-[16px] px-4 py-4 font-body-lg text-body-lg text-on-surface soft-shadow focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          <div>
            <label className="block font-label-md text-label-md text-outline uppercase tracking-wider mb-2" htmlFor="community-desc">
              Description (optionnel)
            </label>
            <textarea
              id="community-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              maxLength={500}
              placeholder="Ex: Un groupe pour s'entraider à retrouver les objets perdus dans le quartier."
              className="w-full bg-surface-container-lowest border border-surface-container-highest rounded-[16px] px-4 py-4 font-body-lg text-body-lg text-on-surface soft-shadow focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
            />
          </div>

          <div>
            <label className="block font-label-md text-label-md text-outline uppercase tracking-wider mb-2">Type d&apos;accès</label>
            <div className="p-1 rounded-[16px] bg-surface-container-lowest border border-surface-container-highest flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsPrivate(false)}
                className={`flex-1 py-2.5 rounded-xl font-label-md text-label-md font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  !isPrivate ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant"
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">public</span>
                Public
              </button>
              <button
                type="button"
                onClick={() => setIsPrivate(true)}
                className={`flex-1 py-2.5 rounded-xl font-label-md text-label-md font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  isPrivate ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant"
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">lock</span>
                Privé
              </button>
            </div>
            <p className="font-label-md text-[12px] text-on-surface-variant mt-2">
              {isPrivate
                ? "L'accès nécessite votre approbation pour chaque demande."
                : "Tout le monde peut découvrir et rejoindre librement."}
            </p>
          </div>

          <div className="flex items-center justify-between p-4 rounded-[16px] bg-surface-container-lowest border border-surface-container-highest">
            <div className="flex flex-col pr-3">
              <span className="font-label-md text-label-md text-on-surface font-semibold">Invitations libres</span>
              <span className="font-label-md text-[12px] text-on-surface-variant">Autoriser les membres à ajouter d&apos;autres personnes</span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={allowMemberInvites}
              onClick={() => setAllowMemberInvites((v) => !v)}
              className={`shrink-0 w-12 h-7 rounded-full p-[2px] transition-colors relative flex items-center ${
                allowMemberInvites ? "bg-primary" : "bg-surface-container-highest"
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full bg-surface-container-lowest shadow-sm transform transition-transform ${
                  allowMemberInvites ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {error && <p className="font-body-md text-[13px] text-error bg-error-container/40 rounded-xl px-4 py-3">{error}</p>}
        </form>
      </main>

      <div className="w-full fixed bottom-0 left-0 p-container-margin bg-background/90 backdrop-blur-xl border-t border-surface-container-highest z-40 pb-8">
        {!canSubmit && !isSubmitting && (
          <p className="max-w-2xl mx-auto font-body-md text-[12px] text-on-surface-variant text-right mb-2">
            {isUploadingCover ? "Patientez pendant l'envoi de la photo…" : "Le nom doit contenir au moins 3 caractères."}
          </p>
        )}
        <div className="max-w-2xl mx-auto flex justify-between items-center gap-md">
          <Link href="/communities" className="text-primary font-headline-sm text-headline-sm px-4 py-2 hover:opacity-80 transition-opacity">
            Annuler
          </Link>
          <button
            type="button"
            disabled={!canSubmit}
            onClick={handleSubmit}
            className="btn-gradient bg-primary text-on-primary rounded-xl px-6 py-3 flex items-center justify-center gap-2 font-headline-sm text-headline-sm shadow-[0px_10px_30px_rgba(0,88,188,0.15)] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Création…" : "Créer"}
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
}
