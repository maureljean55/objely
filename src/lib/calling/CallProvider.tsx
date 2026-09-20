"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { getMyProfile } from "@/lib/supabase/profile";
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
    (callId: string) => {
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
        .subscribe();

      callChannelRef.current = channel;
    },
    [clearRingTimeout, teardown],
  );

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
