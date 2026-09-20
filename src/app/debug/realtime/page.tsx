"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getCurrentUser } from "@/lib/auth";

type LogEntry = { at: string; text: string };

/**
 * Temporary diagnostic page — isolates the exact same registration/
 * broadcast mechanism CallProvider uses (channel "calls:user:<id>"), with
 * no WebRTC/mic/offer complexity, so two people testing calls that never
 * arrive can pin down whether the problem is "my device never subscribes",
 * "the ping never sends", or "it sends and is received but the call UI
 * itself doesn't react" — each shows up differently in the log below.
 */
export default function RealtimeDebugPage() {
  const [myId, setMyId] = useState<string | null>(null);
  const [subscribeStatus, setSubscribeStatus] = useState("En attente de connexion…");
  const [targetId, setTargetId] = useState("");
  const [log, setLog] = useState<LogEntry[]>([]);
  const [copied, setCopied] = useState(false);
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>["channel"]> | null>(null);

  const addLog = (text: string) => {
    setLog((prev) => [{ at: new Date().toLocaleTimeString("fr-FR"), text }, ...prev].slice(0, 30));
  };

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    (async () => {
      const user = await getCurrentUser();
      if (cancelled || !user) {
        setSubscribeStatus("Non connecté.");
        return;
      }
      setMyId(user.id);
      addLog(`Mon ID : ${user.id}`);

      const channel = supabase
        .channel(`calls:user:${user.id}`)
        .on("broadcast", { event: "ping" }, ({ payload }) => {
          addLog(`✅ Ping reçu de ${payload?.fromId ?? "?"} (envoyé à ${payload?.sentAt ?? "?"})`);
        })
        .subscribe((status, err) => {
          setSubscribeStatus(`${status}${err ? ` — ${err.message}` : ""}`);
          addLog(`Statut d'abonnement : ${status}${err ? ` (${err.message})` : ""}`);
        });

      channelRef.current = channel;
    })();

    return () => {
      cancelled = true;
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, []);

  const handleCopyId = async () => {
    if (!myId) return;
    try {
      await navigator.clipboard.writeText(myId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore — the ID is also shown as plain text to copy manually.
    }
  };

  const handleSendPing = async () => {
    const trimmed = targetId.trim();
    if (!trimmed || !myId) return;
    addLog(`Envoi d'un ping vers ${trimmed}…`);
    const supabase = createClient();
    const channel = supabase.channel(`calls:user:${trimmed}`);
    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        const res = await channel.send({ type: "broadcast", event: "ping", payload: { fromId: myId, sentAt: new Date().toLocaleTimeString("fr-FR") } });
        addLog(`Résultat de l'envoi : ${res}`);
        setTimeout(() => supabase.removeChannel(channel), 1000);
      } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        addLog(`❌ Échec de connexion pour l'envoi : ${status}`);
      }
    });
  };

  const handleSendServerPing = async () => {
    const trimmed = targetId.trim();
    if (!trimmed) return;
    addLog(`Envoi d'un ping serveur vers ${trimmed}…`);
    try {
      const res = await fetch("/api/debug/realtime-ping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: trimmed }),
      });
      const data = await res.json();
      addLog(`Réponse serveur : ${JSON.stringify(data)}`);
    } catch {
      addLog("❌ La requête serveur a échoué.");
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface p-lg flex flex-col gap-lg font-body-md">
      <h1 className="font-headline-md text-headline-md">Diagnostic temps réel</h1>

      <section className="bg-surface-container-lowest rounded-2xl p-lg soft-shadow inner-stroke flex flex-col gap-2">
        <h2 className="font-body-lg text-body-lg font-semibold">Mon appareil</h2>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Statut d&apos;abonnement : <span className="font-semibold text-on-surface">{subscribeStatus}</span>
        </p>
        {myId && (
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-surface-container-high rounded-lg px-3 py-2 text-[12px] break-all">{myId}</code>
            <button type="button" onClick={handleCopyId} className="shrink-0 px-3 py-2 rounded-lg bg-primary text-on-primary text-[13px] font-semibold">
              {copied ? "Copié" : "Copier"}
            </button>
          </div>
        )}
        <p className="font-body-md text-[12px] text-on-surface-variant">
          Donne cet ID à l&apos;autre personne (message, appel...), qu&apos;elle le colle ci-dessous sur SON téléphone pour t&apos;envoyer un ping.
        </p>
      </section>

      <section className="bg-surface-container-lowest rounded-2xl p-lg soft-shadow inner-stroke flex flex-col gap-2">
        <h2 className="font-body-lg text-body-lg font-semibold">Envoyer un ping de test</h2>
        <input
          value={targetId}
          onChange={(e) => setTargetId(e.target.value)}
          placeholder="Colle l'ID de l'autre personne ici"
          className="w-full h-12 px-4 rounded-xl bg-surface-container-low border border-transparent text-on-surface text-[13px] outline-none focus:border-primary/30"
        />
        <div className="flex gap-2">
          <button type="button" onClick={handleSendPing} disabled={!targetId.trim()} className="flex-1 h-11 rounded-xl bg-primary text-on-primary font-semibold disabled:opacity-50">
            Ping depuis mon téléphone
          </button>
          <button type="button" onClick={handleSendServerPing} disabled={!targetId.trim()} className="flex-1 h-11 rounded-xl bg-secondary text-on-secondary font-semibold disabled:opacity-50">
            Ping depuis le serveur
          </button>
        </div>
      </section>

      <section className="bg-surface-container-lowest rounded-2xl p-lg soft-shadow inner-stroke flex flex-col gap-2">
        <h2 className="font-body-lg text-body-lg font-semibold">Journal</h2>
        <div className="flex flex-col gap-1 max-h-[50vh] overflow-y-auto">
          {log.length === 0 && <p className="text-on-surface-variant text-[13px]">Rien pour le moment.</p>}
          {log.map((entry, i) => (
            <p key={i} className="text-[12px] font-mono">
              <span className="text-on-surface-variant">{entry.at}</span> — {entry.text}
            </p>
          ))}
        </div>
      </section>
    </div>
  );
}
