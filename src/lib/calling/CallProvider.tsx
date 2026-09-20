"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { getMyProfile } from "@/lib/supabase/profile";
import { subscribeToPush } from "@/lib/push/subscribe";
import CallOverlay from "@/components/calling/CallOverlay";

// No TURN server — only public STUN. Works over most home/mobile networks
// (both peers behind ordinary NAT) but can fail to connect behind strict
// corporate firewalls or symmetric NATs, which would need a TURN relay.
const ICE_SERVERS: RTCIceServer[] = [{ urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"] }];

const RING_TIMEOUT_MS = 30000;

export type CallPeer = { id: string; name: string; avatarUrl: string | null };
export type CallStatus = "idle" | "outgoing" | "incoming" | "active";

type CallContextValue = {
  status: CallStatus;
  peer: CallPeer | null;
  muted: boolean;
  elapsedSeconds: number;
  error: string | null;
  startCall: (peer: CallPeer) => void;
  acceptCall: () => void;
  declineCall: () => void;
  endCall: () => void;
  toggleMute: () => void;
  dismissError: () => void;
};

const CallContext = createContext<CallContextValue | null>(null);

export function useCall() {
  const ctx = useContext(CallContext);
  if (!ctx) throw new Error("useCall must be used within CallProvider");
  return ctx;
}

type IncomingOffer = { callId: string; from: CallPeer; sdp: RTCSessionDescriptionInit };

export default function CallProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<CallStatus>("idle");
  const [peer, setPeer] = useState<CallPeer | null>(null);
  const [muted, setMuted] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const meRef = useRef<CallPeer | null>(null);
  const userChannelRef = useRef<RealtimeChannel | null>(null);
  const callChannelRef = useRef<RealtimeChannel | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const incomingOfferRef = useRef<IncomingOffer | null>(null);
  const lastOfferRef = useRef<{ callId: string; sdp: RTCSessionDescriptionInit } | null>(null);
  const ringTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const statusRef = useRef<CallStatus>("idle");

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const clearRingTimeout = useCallback(() => {
    if (ringTimeoutRef.current) {
      clearTimeout(ringTimeoutRef.current);
      ringTimeoutRef.current = null;
    }
  }, []);

  const teardown = useCallback(() => {
    clearRingTimeout();
    pcRef.current?.close();
    pcRef.current = null;
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
    if (remoteAudioRef.current) remoteAudioRef.current.srcObject = null;
    pendingCandidatesRef.current = [];
    incomingOfferRef.current = null;
    lastOfferRef.current = null;
    startedAtRef.current = null;
    if (callChannelRef.current) {
      const supabase = createClient();
      supabase.removeChannel(callChannelRef.current);
      callChannelRef.current = null;
    }
    setStatus("idle");
    setPeer(null);
    setMuted(false);
    setElapsedSeconds(0);
  }, [clearRingTimeout]);

  const joinCallChannel = useCallback(
    (callId: string, onSubscribed?: () => void) => {
      const supabase = createClient();
      const channel = supabase
        .channel(`call:${callId}`)
        .on("broadcast", { event: "answer" }, async ({ payload }) => {
          const pc = pcRef.current;
          if (!pc) return;
          await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
          for (const candidate of pendingCandidatesRef.current) await pc.addIceCandidate(candidate).catch(() => {});
          pendingCandidatesRef.current = [];
          clearRingTimeout();
          startedAtRef.current = Date.now();
          setElapsedSeconds(0);
          setStatus("active");
        })
        .on("broadcast", { event: "candidate" }, async ({ payload }) => {
          const pc = pcRef.current;
          const candidate = payload.candidate as RTCIceCandidateInit;
          if (!pc || !pc.remoteDescription) {
            pendingCandidatesRef.current.push(candidate);
            return;
          }
          await pc.addIceCandidate(candidate).catch(() => {});
        })
        .on("broadcast", { event: "end" }, ({ payload }) => {
          const reason = payload?.reason as string | undefined;
          if (statusRef.current === "outgoing" && reason === "decline") setError("Appel refusé.");
          teardown();
        })
        // The callee's device may only wake up (via a push notification)
        // after missing the original Realtime "ring" entirely — this lets
        // it ask the still-waiting caller to resend the offer it already
        // has in memory, instead of needing anything replayed server-side.
        .on("broadcast", { event: "request-offer" }, () => {
          const last = lastOfferRef.current;
          if (last?.callId !== callId || !meRef.current) return;
          channel.send({ type: "broadcast", event: "offer-resend", payload: { from: meRef.current, sdp: last.sdp } });
        })
        .on("broadcast", { event: "offer-resend" }, ({ payload }) => {
          if (statusRef.current !== "idle" || incomingOfferRef.current) return;
          incomingOfferRef.current = { callId, from: payload.from, sdp: payload.sdp };
          setPeer(payload.from);
          setStatus("incoming");
        })
        .subscribe((subStatus) => {
          if (subStatus === "SUBSCRIBED") onSubscribed?.();
        });

      callChannelRef.current = channel;
    },
    [clearRingTimeout, teardown],
  );

  // Resumes a call after this device was woken up by a push notification
  // (see public/sw.js's notificationclick, which reopens the app at
  // `/?call=<callId>`) rather than by the Realtime "ring" — that broadcast
  // has no replay for a client that wasn't connected yet to receive it.
  const resumeCallFromPush = useCallback(
    (callId: string) => {
      if (statusRef.current !== "idle") return;
      joinCallChannel(callId, () => {
        callChannelRef.current?.send({ type: "broadcast", event: "request-offer", payload: {} });
      });
      // The caller may already have given up (its own 30s ring timeout) by
      // the time this device opens the notification — don't wait forever
      // for an offer that's never coming.
      setTimeout(() => {
        if (statusRef.current === "idle") teardown();
      }, 10000);
    },
    [joinCallChannel, teardown],
  );

  // Picks up a `?call=<id>` left by the push notification's click handler,
  // once, on first mount — then strips it so a later refresh of the same
  // URL doesn't try to resume a call that's long over.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const callId = params.get("call");
    if (!callId) return;
    params.delete("call");
    const query = params.toString();
    window.history.replaceState({}, "", `${window.location.pathname}${query ? `?${query}` : ""}`);
    resumeCallFromPush(callId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createPeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    pc.onicecandidate = (e) => {
      if (e.candidate) callChannelRef.current?.send({ type: "broadcast", event: "candidate", payload: { candidate: e.candidate.toJSON() } });
    };
    pc.ontrack = (e) => {
      if (remoteAudioRef.current) remoteAudioRef.current.srcObject = e.streams[0];
    };
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "failed" || pc.connectionState === "closed") {
        if (statusRef.current !== "idle") setError("La connexion a été interrompue.");
        teardown();
      }
    };
    pcRef.current = pc;
    return pc;
  }, [teardown]);

  // Registers this user under a stable, per-user channel so a peer can ring
  // them from anywhere in the app — not just while a specific chat is open.
  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    const setup = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user ?? null;
      if (!user || cancelled) return;

      const { data: profile } = await getMyProfile();
      if (cancelled) return;
      meRef.current = {
        id: user.id,
        name: profile?.full_name || (user.user_metadata?.full_name as string | undefined) || "Utilisateur Objely",
        avatarUrl: profile?.avatar_url ?? null,
      };
      void subscribeToPush(user.id);

      const channel = supabase
        .channel(`calls:user:${user.id}`)
        .on("broadcast", { event: "ring" }, ({ payload }) => {
          const incoming = payload as IncomingOffer;
          // Already on a call — let the caller's own ring timeout handle it
          // as "no answer" rather than juggling a second call here.
          if (statusRef.current !== "idle") return;
          incomingOfferRef.current = incoming;
          joinCallChannel(incoming.callId);
          setPeer(incoming.from);
          setStatus("incoming");
        })
        .subscribe();

      userChannelRef.current = channel;
    };

    setup();

    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        meRef.current = null;
        if (userChannelRef.current) {
          supabase.removeChannel(userChannelRef.current);
          userChannelRef.current = null;
        }
      }
    });

    return () => {
      cancelled = true;
      authListener.subscription.unsubscribe();
      if (userChannelRef.current) supabase.removeChannel(userChannelRef.current);
    };
  }, [joinCallChannel]);

  // Call duration ticker — the initial "0" is set where status flips to
  // "active" (joinCallChannel's answer handler, acceptCall), not here, so
  // this effect only ever subscribes to the clock rather than also owning
  // a state write on every mount.
  useEffect(() => {
    if (status !== "active") return;
    const interval = setInterval(() => {
      if (startedAtRef.current) setElapsedSeconds(Math.floor((Date.now() - startedAtRef.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [status]);

  const startCall = useCallback(
    async (target: CallPeer) => {
      if (statusRef.current !== "idle" || !meRef.current) return;
      setError(null);

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch {
        setError("Microphone inaccessible. Vérifiez les autorisations de l'application.");
        return;
      }
      localStreamRef.current = stream;

      const callId = crypto.randomUUID();
      setPeer(target);
      setStatus("outgoing");

      joinCallChannel(callId);
      const pc = createPeerConnection();
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      lastOfferRef.current = { callId, sdp: offer };

      const supabase = createClient();
      const ringChannel = supabase.channel(`calls:user:${target.id}`);
      ringChannel.subscribe((subStatus) => {
        if (subStatus === "SUBSCRIBED") {
          ringChannel.send({
            type: "broadcast",
            event: "ring",
            payload: { callId, from: meRef.current, sdp: offer },
          });
          setTimeout(() => supabase.removeChannel(ringChannel), 1000);
        }
      });

      // Backup path in case the client-side broadcast above doesn't land
      // (flaky mobile connection, slow handshake) and/or the callee's app
      // is closed — see src/app/api/calls/ring/route.ts.
      fetch("/api/calls/ring", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUserId: target.id,
          callId,
          callerName: meRef.current.name,
          callerAvatarUrl: meRef.current.avatarUrl,
          sdp: offer,
        }),
      }).catch(() => {});

      ringTimeoutRef.current = setTimeout(() => {
        setError("Pas de réponse.");
        callChannelRef.current?.send({ type: "broadcast", event: "end", payload: { reason: "timeout" } });
        teardown();
      }, RING_TIMEOUT_MS);
    },
    [joinCallChannel, createPeerConnection, teardown],
  );

  const acceptCall = useCallback(async () => {
    const incoming = incomingOfferRef.current;
    if (!incoming || statusRef.current !== "incoming") return;

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setError("Microphone inaccessible. Vérifiez les autorisations de l'application.");
      callChannelRef.current?.send({ type: "broadcast", event: "end", payload: { reason: "decline" } });
      teardown();
      return;
    }
    localStreamRef.current = stream;

    const pc = createPeerConnection();
    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    await pc.setRemoteDescription(new RTCSessionDescription(incoming.sdp));
    for (const candidate of pendingCandidatesRef.current) await pc.addIceCandidate(candidate).catch(() => {});
    pendingCandidatesRef.current = [];

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    callChannelRef.current?.send({ type: "broadcast", event: "answer", payload: { sdp: answer } });

    startedAtRef.current = Date.now();
    setElapsedSeconds(0);
    setStatus("active");
  }, [createPeerConnection, teardown]);

  const declineCall = useCallback(() => {
    callChannelRef.current?.send({ type: "broadcast", event: "end", payload: { reason: "decline" } });
    teardown();
  }, [teardown]);

  const endCall = useCallback(() => {
    callChannelRef.current?.send({ type: "broadcast", event: "end", payload: { reason: "hangup" } });
    teardown();
  }, [teardown]);

  const toggleMute = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    const next = !muted;
    stream.getAudioTracks().forEach((track) => (track.enabled = !next));
    setMuted(next);
  }, [muted]);

  const dismissError = useCallback(() => setError(null), []);

  return (
    <CallContext.Provider
      value={{ status, peer, muted, elapsedSeconds, error, startCall, acceptCall, declineCall, endCall, toggleMute, dismissError }}
    >
      {children}
      <audio ref={remoteAudioRef} autoPlay playsInline className="hidden" />
      <CallOverlay />
    </CallContext.Provider>
  );
}
