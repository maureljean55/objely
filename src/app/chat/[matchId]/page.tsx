"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getMatch, listMessages, sendMessage, type MatchWithItems, type Message } from "@/lib/supabase/messages";
import type { Item } from "@/lib/supabase/items";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function SecureChatPage() {
  const router = useRouter();
  const params = useParams<{ matchId: string }>();
  const matchId = params.matchId;

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [match, setMatch] = useState<MatchWithItems | null>(null);
  const [otherName, setOtherName] = useState<string>("Correspondant");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadError, setLoadError] = useState(false);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const supabase = createClient();

    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) {
        setLoadError(true);
        return;
      }
      setCurrentUserId(user.id);

      const { data: matchData, error: matchErr } = await getMatch(matchId);
      if (matchErr || !matchData) {
        setLoadError(true);
        return;
      }
      setMatch(matchData);

      const isLostSide = matchData.lost_item.user_id === user.id;
      const otherUserId = isLostSide ? matchData.found_item.user_id : matchData.lost_item.user_id;

      const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", otherUserId).maybeSingle<{ full_name: string | null }>();
      if (profile?.full_name) setOtherName(profile.full_name);

      const { data: messageData } = await listMessages(matchId);
      setMessages(messageData ?? []);
    })();
  }, [matchId]);

  const handleSend = async () => {
    const body = draft.trim();
    if (!body || isSending) return;
    setIsSending(true);
    setDraft("");
    const { data, error } = await sendMessage(matchId, body);
    if (!error && data) {
      setMessages((prev) => [...prev, data]);
    }
    setIsSending(false);
  };

  if (loadError) {
    return (
      <div className="bg-background text-on-background antialiased min-h-screen flex flex-col items-center justify-center px-container-margin text-center">
        <p className="font-body-md text-body-md text-on-surface-variant">Conversation introuvable.</p>
        <button type="button" onClick={() => router.push("/activity")} className="text-primary font-semibold mt-4">
          Retour à l&apos;activité
        </button>
      </div>
    );
  }

  const isLostSide = match && currentUserId ? match.lost_item.user_id === currentUserId : true;
  const otherItem: Item | undefined = match ? (isLostSide ? match.found_item : match.lost_item) : undefined;

  return (
    <div className="bg-background text-on-background font-body-md antialiased">
      <header
        className="glass-header fixed top-0 inset-x-0 z-50 flex justify-between items-center w-full px-container-margin pb-base shadow-[0_1px_0_rgba(0,0,0,0.05)]"
        style={{ paddingTop: "calc(0.5rem + env(safe-area-inset-top))" }}
      >
        <button type="button" onClick={() => router.back()} aria-label="Retour" className="text-primary p-2 -ml-2 rounded-full hover:bg-surface-container-high/50 transition-colors flex items-center">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>arrow_back_ios</span>
        </button>
        <div className="flex flex-col items-center">
          <h1 className="font-headline-sm text-headline-sm text-on-surface">{otherItem?.title ?? "Objet"}</h1>
          <p className="font-label-md text-label-md text-outline">
            {isLostSide ? "Trouvé par" : "Perdu par"} {otherName}
          </p>
        </div>
        <div className="w-9" />
      </header>

      <main className="min-h-screen px-container-margin py-md pt-[calc(92px+env(safe-area-inset-top))] pb-[120px] flex flex-col gap-md">
        <div className="bg-surface-container-high rounded-xl p-3 flex items-start gap-3 shadow-sm mx-auto max-w-sm mt-2 mb-4">
          <span className="material-symbols-outlined text-tertiary mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>security</span>
          <p className="font-label-md text-label-md text-on-surface-variant flex-1">
            Pour votre sécurité, <strong className="text-on-surface">ne partagez pas votre adresse personnelle</strong>. Privilégiez un lieu public pour la remise de l&apos;objet.
          </p>
        </div>

        {messages.length === 0 && (
          <p className="font-body-md text-body-md text-on-surface-variant text-center">
            Aucun message pour le moment. Dites bonjour !
          </p>
        )}

        {messages.map((message) => {
          const isMine = message.sender_id === currentUserId;
          return (
            <div key={message.id} className={`flex gap-2 max-w-[85%] ${isMine ? "self-end flex-row-reverse" : "self-start"}`}>
              <div
                className={`w-8 h-8 rounded-full overflow-hidden shrink-0 flex items-center justify-center ${
                  isMine ? "bg-primary text-on-primary" : "bg-surface-container-highest text-on-surface-variant"
                }`}
              >
                <span className="font-label-md text-label-md">{isMine ? "Moi" : initials(otherName)}</span>
              </div>
              <div
                className={`rounded-2xl px-4 py-2.5 shadow-sm ${
                  isMine ? "message-out text-on-primary text-right" : "bg-surface-container message-in text-on-surface"
                }`}
              >
                <p className="font-body-md text-body-md">{message.body}</p>
              </div>
            </div>
          );
        })}
      </main>

      <footer className="glass-input fixed bottom-0 inset-x-0 z-50 p-3 safe-area-pb">
        <div className="flex items-end gap-2 max-w-7xl mx-auto w-full">
          <div className="flex-1 bg-surface-container-low rounded-xl border border-outline-variant/30 px-4 py-2 flex items-center min-h-[44px]">
            <textarea
              ref={textareaRef}
              className="w-full bg-transparent border-none p-0 focus:ring-0 resize-none font-body-md text-body-md text-on-surface placeholder-outline max-h-32"
              placeholder="Message..."
              rows={1}
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value);
                const el = textareaRef.current;
                if (el) {
                  el.style.height = "0px";
                  el.style.height = `${el.scrollHeight}px`;
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
          </div>
          <button
            type="button"
            onClick={handleSend}
            disabled={!draft.trim() || isSending}
            className="p-2 bg-primary text-on-primary rounded-full hover:opacity-90 transition-opacity shrink-0 shadow-sm flex items-center justify-center h-11 w-11 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined ml-1" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
