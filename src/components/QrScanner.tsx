"use client";

import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";

type Props = {
  active: boolean;
  onDecode: (text: string) => void;
};

/** Live camera feed that decodes QR codes frame by frame until one is found. */
export default function QrScanner({ active, onDecode }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const onDecodeRef = useRef(onDecode);

  useEffect(() => {
    onDecodeRef.current = onDecode;
  });

  useEffect(() => {
    if (!active) return;
    // Clear a stale permission error from a previous activation so the
    // camera view gets a clean retry instead of showing an old message.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setError(null);

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
      .getUserMedia({ video: { facingMode: "environment" } })
      .then((s) => {
        if (stopped) {
          s.getTracks().forEach((track) => track.stop());
          return;
        }
        stream = s;
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
    };
  }, [active]);

  if (error) {
    return (
      <div className="aspect-square w-full rounded-2xl border-2 border-dashed border-error/40 bg-error-container/20 flex flex-col items-center justify-center gap-3 text-center px-lg">
        <span className="material-symbols-outlined text-error text-[56px]">videocam_off</span>
        <p className="font-body-md text-body-md text-error max-w-xs">{error}</p>
      </div>
    );
  }

  return (
    <div className="aspect-square w-full rounded-2xl overflow-hidden relative bg-black">
      <video ref={videoRef} muted playsInline className="absolute inset-0 w-full h-full object-cover" />
      <canvas ref={canvasRef} className="hidden" />
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-xl">
        <div className="w-full h-full border-2 border-white/70 rounded-2xl" />
      </div>
    </div>
  );
}
