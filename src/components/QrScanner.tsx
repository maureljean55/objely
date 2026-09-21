"use client";

import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";

type Props = {
  active: boolean;
  onDecode: (text: string) => void;
};

/** Live camera feed that decodes QR codes frame by frame until one is found, with torch, camera-flip and photo-import support. */
export default function QrScanner({ active, onDecode }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const trackRef = useRef<MediaStreamTrack | null>(null);
  const onDecodeRef = useRef(onDecode);
  const [error, setError] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [torchOn, setTorchOn] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);

  useEffect(() => {
    onDecodeRef.current = onDecode;
  });

  useEffect(() => {
    if (!active) return;
    // Clear a stale permission error from a previous activation so the
    // camera view gets a clean retry instead of showing an old message.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setError(null);
    setTorchOn(false);

    let stream: MediaStream | null = null;
    let frameId: number;
    let stopped = false;

    const tick = () => {
      if (stopped) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const result = jsQR(frame.data, frame.width, frame.height);
          if (result?.data) {
            onDecodeRef.current(result.data);
            return;
          }
        }
      }
      frameId = requestAnimationFrame(tick);
    };

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode } })
      .then((s) => {
        if (stopped) {
          s.getTracks().forEach((track) => track.stop());
          return;
        }
        stream = s;
        const track = s.getVideoTracks()[0] ?? null;
        trackRef.current = track;
        const capabilities = track?.getCapabilities?.() as (MediaTrackCapabilities & { torch?: boolean }) | undefined;
        setTorchSupported(!!capabilities?.torch);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          videoRef.current.play();
        }
        frameId = requestAnimationFrame(tick);
      })
      .catch(() => {
        if (!stopped) setError("Impossible d'accéder à la caméra. Vérifiez les autorisations de votre navigateur.");
      });

    return () => {
      stopped = true;
      if (frameId) cancelAnimationFrame(frameId);
      stream?.getTracks().forEach((track) => track.stop());
      trackRef.current = null;
    };
  }, [active, facingMode]);

  const toggleTorch = async () => {
    const track = trackRef.current;
    if (!track) return;
    const next = !torchOn;
    try {
      await track.applyConstraints({ advanced: [{ torch: next } as MediaTrackConstraintSet] });
      setTorchOn(next);
    } catch {
      // Some devices report the capability but reject the constraint — no
      // point surfacing an error for a purely cosmetic control.
    }
  };

  const flipCamera = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  const handleImportFile = (file: File) => {
    setImportError(null);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const result = jsQR(frame.data, frame.width, frame.height);
      URL.revokeObjectURL(img.src);
      if (result?.data) {
        onDecodeRef.current(result.data);
      } else {
        setImportError("Aucun QR Code détecté dans cette photo.");
        setTimeout(() => setImportError(null), 3000);
      }
    };
    img.src = URL.createObjectURL(file);
  };

  if (error) {
    return (
      <div className="aspect-[4/5] w-full rounded-3xl border-2 border-dashed border-error/40 bg-error-container/20 flex flex-col items-center justify-center gap-3 text-center px-lg">
        <span className="material-symbols-outlined text-error text-[56px]">videocam_off</span>
        <p className="font-body-md text-body-md text-error max-w-xs">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-[4/5] rounded-3xl overflow-hidden shadow-xl bg-inverse-surface">
      <video ref={videoRef} muted playsInline className="absolute inset-0 w-full h-full object-cover" />
      <canvas ref={canvasRef} className="hidden" />
      <div className="absolute inset-0 bg-gradient-to-b from-inverse-surface/60 via-transparent to-inverse-surface/80 pointer-events-none" />

      <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between p-4">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-lowest/80 backdrop-blur-md shadow-sm">
          <span className="material-symbols-outlined text-[15px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
            verified_user
          </span>
          <span className="font-label-sm text-label-sm text-on-surface tracking-wide">Scan sécurisé Objely</span>
        </div>
        <div className="flex items-center gap-2">
          {torchSupported && (
            <button
              type="button"
              onClick={toggleTorch}
              aria-label={torchOn ? "Éteindre la lampe torche" : "Allumer la lampe torche"}
              className={`w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center transition-all active:scale-90 shadow-sm ${
                torchOn ? "bg-primary-container text-on-primary-container" : "bg-surface-container-lowest/75 text-on-surface"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{torchOn ? "flashlight_off" : "flashlight_on"}</span>
            </button>
          )}
          <button
            type="button"
            onClick={flipCamera}
            aria-label="Changer de caméra"
            className="w-10 h-10 rounded-full bg-surface-container-lowest/75 backdrop-blur-md text-on-surface flex items-center justify-center transition-transform active:scale-90 shadow-sm"
          >
            <span className="material-symbols-outlined text-[20px]">flip_camera_ios</span>
          </button>
        </div>
      </div>

      <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
        <div className="relative w-60 h-60 max-w-[70%] max-h-[70%]">
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-2xl" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-2xl" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-2xl" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-2xl" />
          <div className="absolute inset-x-3 h-1 bg-gradient-to-r from-primary via-secondary-container to-secondary rounded-full shadow-[0_0_12px_#0073dd] qr-scan-line" />
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-between p-4">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-inverse-surface/60 backdrop-blur-md text-surface-container-lowest text-label-sm font-label-sm active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined text-[16px]">photo_library</span>
          <span>Importer une photo</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) handleImportFile(file);
          }}
        />
        <div className="flex items-center gap-1.5 text-surface-container-lowest/80 text-label-sm font-label-sm">
          <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
          <span>Recherche active</span>
        </div>
      </div>

      {importError && (
        <div className="absolute inset-x-4 bottom-16 z-20 text-center">
          <p className="inline-block font-body-md text-body-md text-[13px] text-white bg-error/90 backdrop-blur-md rounded-full px-4 py-2">
            {importError}
          </p>
        </div>
      )}
    </div>
  );
}
