"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "objely-entry-disclaimer-acknowledged";

/**
 * Blocking legal notice shown once per browser to a not-yet-registered
 * visitor: Objely helps reunite people with lost/found items, but doesn't
 * replace filing an official declaration with the competent authorities.
 * No close button and no click-outside dismissal — only checking the box
 * and pressing the button clears it, and that's tracked in localStorage
 * (not a user account, since this is specifically for people without one
 * yet) so it never reappears in this browser once acknowledged.
 */
export default function EntryDisclaimer() {
  const [visible, setVisible] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let alreadySeen = true;
    try {
      alreadySeen = localStorage.getItem(STORAGE_KEY) === "true";
    } catch {}
    // localStorage is only readable client-side, so this can't be a lazy
    // initial state during SSR without risking a hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!alreadySeen) setVisible(true);
  }, []);

  const acknowledge = () => {
    if (!checked) return;
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {}
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="entry-disclaimer-title"
      className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center"
    >
      <div className="w-full sm:w-[520px] sm:max-h-[85vh] bg-surface-container-lowest rounded-t-[28px] sm:rounded-[28px] shadow-2xl flex flex-col max-h-[92vh]">
        <div className="overflow-y-auto px-lg pt-lg pb-md">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mb-4 shadow-sm"
            style={{ background: "linear-gradient(135deg, #0058bc, #5952af)" }}
          >
            <span className="material-symbols-outlined text-white text-[26px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              info
            </span>
          </div>

          <h2 id="entry-disclaimer-title" className="font-headline-md text-headline-md text-on-surface mb-3">
            Avant de continuer
          </h2>

          <div className="flex flex-col gap-3 font-body-md text-body-md text-on-surface-variant">
            <p>
              Objely a été conçu pour vous faciliter la tâche lorsqu&apos;il s&apos;agit de retrouver un objet que vous avez
              perdu, ou d&apos;aider une autre personne à retrouver le sien lorsque vous en trouvez un. Grâce à la mise en
              correspondance automatique entre déclarations, à la vérification de propriété et à une messagerie sécurisée
              entre utilisateurs, notre objectif est de rendre la remise en main propre des objets aussi simple et sûre que
              possible.
            </p>
            <p>
              Cependant, Objely reste un service d&apos;entraide entre particuliers et ne remplace en aucun cas les
              démarches officielles. En cas de perte, et surtout en cas de <strong className="text-on-surface">vol</strong>{" "}
              ou de perte de documents officiels (pièce d&apos;identité, passeport, carte bancaire, titre de transport,
              etc.), il est indispensable d&apos;effectuer une déclaration auprès des autorités et institutions
              compétentes : commissariat de police, gendarmerie, service en ligne officiel, votre banque, ou tout autre
              organisme concerné selon votre situation.
            </p>
            <p>
              L&apos;utilisation d&apos;Objely ne vous dispense donc jamais de ces démarches légales et administratives.
              Nous vous encourageons à les effectuer en parallèle ou en amont de votre déclaration sur l&apos;application,
              notamment pour toute question d&apos;assurance, de responsabilité ou de sécurité.
            </p>
            <p>
              Objely ne garantit pas la restitution d&apos;un objet et ne peut être tenu responsable des échanges entre
              utilisateurs. Privilégiez toujours un lieu public pour vos rencontres et ne communiquez jamais
              d&apos;informations bancaires ou sensibles à un autre utilisateur.
            </p>
          </div>
        </div>

        <div className="px-lg pb-lg pt-md border-t border-outline-variant/30 bg-surface-container-lowest rounded-b-[28px] sm:rounded-b-[28px]">
          <label className="flex items-start gap-3 mb-md cursor-pointer select-none">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
              className="mt-0.5 w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary/30 shrink-0"
            />
            <span className="font-body-md text-body-md text-on-surface">
              J&apos;ai lu et je comprends qu&apos;Objely ne remplace pas une déclaration auprès des institutions
              compétentes.
            </span>
          </label>

          <button
            type="button"
            disabled={!checked}
            onClick={acknowledge}
            className="w-full h-14 bg-primary btn-gradient text-on-primary rounded-2xl font-headline-sm text-headline-sm flex items-center justify-center hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            OK, j&apos;ai compris
          </button>
        </div>
      </div>
    </div>
  );
}
