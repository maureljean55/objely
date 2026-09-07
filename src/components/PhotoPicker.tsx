"use client";

import { useRef, useState } from "react";
import { uploadItemPhoto } from "@/lib/supabase/items";

const MAX_PHOTOS = 5;
const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.82;

type Slot = { id: string; previewUrl: string; status: "uploading" | "done" | "error"; finalUrl?: string };

// Phone camera photos are routinely 3-10MB; resizing/re-encoding client-side
// before upload cuts real transfer time, not just perceived speed.
async function compressImage(file: File): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);
    const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY));
    return blob ? new File([blob], file.name.replace(/\.\w+$/, ".jpg"), { type: "image/jpeg" }) : file;
  } catch {
    return file;
  }
}

export default function PhotoPicker({
  photos,
  onChange,
  onUploadingChange,
}: {
  photos: string[];
  onChange: (photos: string[]) => void;
  onUploadingChange?: (uploading: boolean) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [slots, setSlots] = useState<Slot[]>(() =>
    photos.map((url) => ({ id: url, previewUrl: url, status: "done", finalUrl: url })),
  );
  const slotsRef = useRef(slots);
  const [error, setError] = useState<string | null>(null);

  const applySlots = (next: Slot[]) => {
    slotsRef.current = next;
    setSlots(next);
    onChange(next.filter((s) => s.status === "done" && s.finalUrl).map((s) => s.finalUrl as string));
    onUploadingChange?.(next.some((s) => s.status === "uploading"));
  };

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).slice(0, MAX_PHOTOS - slotsRef.current.length);
    e.target.value = "";
    if (files.length === 0) return;

    setError(null);
    const newSlots: Slot[] = files.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      previewUrl: URL.createObjectURL(file),
      status: "uploading",
    }));
    applySlots([...slotsRef.current, ...newSlots]);

    await Promise.all(
      files.map(async (file, i) => {
        const slot = newSlots[i];
        const compressed = await compressImage(file);
        const { url } = await uploadItemPhoto(compressed);
        applySlots(
          slotsRef.current.map((s) =>
            s.id === slot.id ? (url ? { ...s, status: "done" as const, finalUrl: url } : { ...s, status: "error" as const }) : s,
          ),
        );
        if (!url) setError("Certaines photos n'ont pas pu être envoyées, réessayez.");
      }),
    );
  };

  const removeSlot = (id: string) => {
    const slot = slotsRef.current.find((s) => s.id === id);
    if (slot?.previewUrl.startsWith("blob:")) URL.revokeObjectURL(slot.previewUrl);
    applySlots(slotsRef.current.filter((s) => s.id !== id));
  };

  return (
    <div>
      <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFilesSelected} />

      {slots.length === 0 ? (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-48 bg-surface-container-lowest rounded-[24px] border border-dashed border-outline-variant flex flex-col items-center justify-center p-6 text-center soft-shadow hover:bg-surface-container-low transition-colors"
        >
          <span className="material-symbols-outlined text-4xl text-primary mb-3">photo_camera</span>
          <span className="font-headline-sm text-headline-sm text-primary mb-1">Ajouter une photo</span>
          <span className="font-body-md text-body-md text-on-surface-variant">
            Prenez une photo ou choisissez-en une depuis votre galerie
          </span>
        </button>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {slots.map((slot) => (
            <div key={slot.id} className="relative shrink-0 w-24 h-24 rounded-2xl overflow-hidden soft-shadow bg-surface-container-high">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={slot.previewUrl} alt="" className="w-full h-full object-cover" />
              {slot.status === "uploading" && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                </div>
              )}
              {slot.status === "error" && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-[20px]">error</span>
                </div>
              )}
              <button
                type="button"
                onClick={() => removeSlot(slot.id)}
                aria-label="Supprimer la photo"
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
          ))}
          {slots.length < MAX_PHOTOS && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="shrink-0 w-24 h-24 rounded-2xl border border-dashed border-outline-variant flex items-center justify-center text-primary hover:bg-surface-container-low transition-colors"
            >
              <span className="material-symbols-outlined text-2xl">add</span>
            </button>
          )}
        </div>
      )}

      {error && <p className="font-body-md text-[13px] text-error mt-2">{error}</p>}
    </div>
  );
}
