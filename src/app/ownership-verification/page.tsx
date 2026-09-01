"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function OwnershipVerificationPage() {
  const router = useRouter();

  return (
    <div className="bg-background text-on-surface antialiased min-h-screen flex flex-col pb-24 md:pb-0">
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md shadow-sm">
        <div className="flex items-center justify-between px-container-margin py-sm w-full max-w-full mx-auto md:max-w-[1140px]">
          <Link
            href="/matching"
            className="w-10 h-10 flex items-center justify-center rounded-full hover:opacity-80 transition-opacity active:scale-95 text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>arrow_back</span>
          </Link>
          <h1 className="font-display text-headline-sm font-bold text-on-surface flex-1 text-center truncate px-2">Vérification</h1>
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:opacity-80 transition-opacity active:scale-95 text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary/20">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>info</span>
          </button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[1140px] mx-auto pt-24 px-container-margin md:px-xl pb-32">
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
            <div className="bg-surface-container-lowest rounded-xl soft-shadow inner-stroke overflow-hidden flex flex-col">
              <div className="relative h-48 w-full bg-surface-container-high">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="Objet trouvé - portefeuille (photo floutée)"
                  className="w-full h-full object-cover filter blur-sm scale-110 opacity-90 transition-all duration-500 hover:blur-md"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuD9uwELYpCAg-H2lwfgw6zwBhEWCfYnsqaKo5hOlNVY5RWyoG7ikbvy2H_AS59f383yydhPI6sf2kypKog-HtW-gnyAsI_DlcRjjilULCAu8XCRJ8OLeYJZgU3WaqREQpH1ZcRxucTu9u2u6FaBZUU7B1VbaY23jvsHM32b0aAaSvl6iHJln7sqip57Lxdi265_sR6di47mOUKNueY75YPNSfkD5L-migV8RzBADRGIlzKgTa-xmenk"
                />
                <div className="absolute top-md right-md bg-surface-container-lowest/90 backdrop-blur-md px-3 py-1 rounded-full border border-surface-variant flex items-center gap-2 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse" />
                  <span className="font-label-md text-label-md text-on-surface">Trouvé le 12 Oct</span>
                </div>
              </div>
              <div className="p-md flex items-center justify-between bg-surface-container-lowest">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary-fixed/30 flex items-center justify-center text-on-secondary-fixed">
                    <span className="material-symbols-outlined text-[20px]">wallet</span>
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface">Portefeuille en cuir</h3>
                    <p className="font-body-md text-body-md text-on-surface-variant text-sm">Paris 10e, Métro Gare du Nord</p>
                  </div>
                </div>
              </div>
            </div>

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
                router.push("/chat");
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
                  placeholder="Ex: Il y a une carte de fidélité Monoprix rouge, et une vieille photo d'identité pliée dans la pochette gauche..."
                  rows={4}
                />
              </div>

              <div className="pt-sm flex flex-col sm:flex-row-reverse gap-sm mt-md">
                <button
                  type="submit"
                  className="btn-primary-gradient min-h-[56px] px-lg rounded-[16px] flex-1 flex items-center justify-center gap-2 text-on-primary font-headline-sm text-headline-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-md shadow-primary/20"
                >
                  Vérifier la propriété
                  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </button>
                <Link
                  href="/matching"
                  className="min-h-[56px] px-lg rounded-[16px] sm:w-auto bg-transparent border-none text-primary-container font-headline-sm text-headline-sm hover:bg-surface-container-high/50 active:scale-[0.98] transition-all flex items-center justify-center"
                >
                  Annuler
                </Link>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
