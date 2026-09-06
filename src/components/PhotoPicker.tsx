"use client";

import { useRef, useState } from "react";
import { uploadItemPhoto } from "@/lib/supabase/items";

const MAX_PHOTOS = 5;

export default function PhotoPicker({ photos, onChange }: { photos: string[]; onChange: (photos: string[]) => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).slice(0, MAX_PHOTOS - photos.length);
    e.target.value = "";
    if (files.length === 0) return;

    setIsUploading(true);
    setError(null);
    const results = await Promise.all(files.map((file) => uploadItemPhoto(file)));
    const uploaded = results.filter((r) => r.url).map((r) => r.url as string);
    if (uploaded.length < files.length) {
      setError("Certaines photos n'ont pas pu être envoyées, réessayez.");
    }
    onChange([...photos, ...uploaded]);
    setIsUploading(false);
  };

  const removePhoto = (url: string) => {
    onChange(photos.filter((p) => p !== url));
  };

  return (
    <div>
      <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFilesSelected} />

      {photos.length === 0 ? (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-full h-48 bg-surface-container-lowest rounded-[24px] border border-dashed border-outline-variant flex flex-col items-center justify-center p-6 text-center soft-shadow hover:bg-surface-container-low transition-colors disabled:opacity-60"
        >
          <span className="material-symbols-outlined text-4xl text-primary mb-3">photo_camera</span>
          <span className="font-headline-sm text-headline-sm text-primary mb-1">
            {isUploading ? "Envoi en cours…" : "Ajouter une photo"}
          </span>
          <span className="font-body-md text-body-md text-on-surface-variant">
            Prenez une photo ou choisissez-en une depuis votre galerie
          </span>
        </button>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {photos.map((url) => (
            <div key={url} className="relative shrink-0 w-24 h-24 rounded-2xl overflow-hidden soft-shadow bg-surface-container-high">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removePhoto(url)}
                aria-label="Supprimer la photo"
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
          ))}
          {photos.length < MAX_PHOTOS && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="shrink-0 w-24 h-24 rounded-2xl border border-dashed border-outline-variant flex items-center justify-center text-primary hover:bg-surface-container-low transition-colors disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-2xl">
                {isUploading ? "hourglass_empty" : "add"}
              </span>
            </button>
          )}
        </div>
      )}

      {error && <p className="font-body-md text-[13px] text-error mt-2">{error}</p>}
    </div>
  );
}
