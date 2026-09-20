"use client";

import Image from "next/image";
import { useCall } from "@/lib/calling/CallProvider";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function CallOverlay() {
  const { status, peer, muted, elapsedSeconds, error, acceptCall, declineCall, endCall, toggleMute, dismissError } = useCall();

  if (status === "idle") {
    if (!error) return null;
    return (
      <div className="fixed inset-x-0 top-0 z-[200] flex justify-center px-container-margin pt-[calc(1rem+env(safe-area-inset-top))]">
        <div
          role="alert"
          className="flex items-center gap-2.5 bg-surface-container-lowest rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.18)] border border-outline-variant/15 pl-4 pr-2 py-2 animate-popIn"
        >
          <span className="material-symbols-outlined text-error text-[20px]">call_end</span>
          <span className="font-body-md text-body-md text-on-surface">{error}</span>
          <button type="button" onClick={dismissError} aria-label="Fermer" className="p-1 text-on-surface-variant">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      </div>
    );
  }

  if (!peer) return null;

  const label = status === "outgoing" ? "Appel en cours…" : status === "incoming" ? "Appel entrant…" : formatDuration(elapsedSeconds);

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-between bg-gradient-to-b from-[#0a1f3d] to-[#050b16] text-white px-container-margin py-10 safe-area-pb" style={{ paddingTop: "calc(2.5rem + env(safe-area-inset-top))" }}>
      <div className="flex flex-col items-center gap-1">
        <span className="font-label-md text-label-md text-white/60 uppercase tracking-wider">Objely</span>
      </div>

      <div className="flex flex-col items-center gap-4">
        <div className="relative w-32 h-32 flex items-center justify-center">
          {(status === "outgoing" || status === "incoming") && (
            <>
              <span className="absolute inset-0 rounded-full bg-white/10 animate-ping" />
              <span className="absolute inset-0 rounded-full bg-white/10 animate-ping" style={{ animationDelay: "0.5s" }} />
            </>
          )}
          <div className="relative w-28 h-28 rounded-full overflow-hidden bg-white/10 flex items-center justify-center shadow-lg">
            {peer.avatarUrl ? (
              <Image alt={peer.name} src={peer.avatarUrl} fill sizes="112px" className="object-cover" />
            ) : (
              <span className="font-headline-lg text-headline-lg text-white">{initials(peer.name)}</span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-center gap-1">
          <h1 className="font-headline-lg text-headline-lg text-white">{peer.name}</h1>
          <p className="font-body-lg text-body-lg text-white/70">{label}</p>
        </div>
      </div>

      <div className="flex items-center gap-8">
        {status === "incoming" ? (
          <>
            <button
              type="button"
              onClick={declineCall}
              aria-label="Refuser"
              className="w-16 h-16 rounded-full bg-error flex items-center justify-center shadow-lg active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>call_end</span>
            </button>
            <button
              type="button"
              onClick={acceptCall}
              aria-label="Accepter"
              className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>call</span>
            </button>
          </>
        ) : (
          <>
            {status === "active" && (
              <button
                type="button"
                onClick={toggleMute}
                aria-label={muted ? "Réactiver le micro" : "Couper le micro"}
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform ${
                  muted ? "bg-white text-[#0a1f3d]" : "bg-white/15 text-white"
                }`}
              >
                <span className="material-symbols-outlined text-[24px]">{muted ? "mic_off" : "mic"}</span>
              </button>
            )}
            <button
              type="button"
              onClick={endCall}
              aria-label="Raccrocher"
              className="w-16 h-16 rounded-full bg-error flex items-center justify-center shadow-lg active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>call_end</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
