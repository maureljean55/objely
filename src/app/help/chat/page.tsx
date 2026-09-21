"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { uploadSupportAttachment } from "@/lib/supabase/supportAttachments";
import { createClient } from "@/lib/supabase/client";

// Mirrors INACTIVITY_ARCHIVE_MS in /api/support-chat — the server already
// archives a stale "bot" conversation and starts a fresh one the next time
// it's asked for, but that only fired on next page load. This client-side
// timer re-asks while the tab stays open so a forgotten chat actually
// resets after 10 minutes instead of only on the next visit.
const INACTIVITY_ARCHIVE_MS = 10 * 60 * 1000;

const SUGGESTIONS = [
  { icon: "search", label: "Problème avec une correspondance" },
  { icon: "package_2", label: "Problème avec un objet" },
  { icon: "help", label: "Comment déclarer un objet ?" },
];

type SupportMessage = {
  id: string;
  sender: "user" | "bot" | "admin";
  sender_name?: string | null;
  kind: "text" | "attachment";
  body: string | null;
  attachment_url: string | null;
  attachment_name: string | null;
  attachment_type: string | null;
  created_at: string;
};

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function attachmentIcon(type: string | null) {
  if (type?.startsWith("image/")) return "image";
  if (type === "application/pdf") return "picture_as_pdf";
  return "description";
}

function HelpChatContent() {
  const searchParams = useSearchParams();
  const resumeId = searchParams.get("conversation");

  const [conversationId, setConversationId] = useState<string | null>(null);
  const [status, setStatus] = useState<"bot" | "escalated" | "closed">("bot");
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sendError, setSendError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const pendingIdRef = useRef(0);

  useEffect(() => {
    // Without this, an in-flight request from a previous invocation of this
    // effect (React Strict Mode's double-invoke in dev, or a fast re-render)
    // can resolve AFTER a newer one and overwrite fresh state with stale
    // data — e.g. showing the just-archived conversation's old messages
    // instead of the brand-new one just created for it.
    let cancelled = false;
    const url = resumeId ? `/api/support-chat?conversation=${resumeId}` : "/api/support-chat";
    fetch(url, { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error("request failed");
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        if (data.conversation) {
          setConversationId(data.conversation.id);
          setStatus(data.conversation.status);
        }
        setMessages(data.messages ?? []);
        setIsLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setLoadError(true);
        setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [resumeId, refreshKey]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Only the live "current chat" flow (not a specific conversation resumed
  // from Historique — the server never auto-archives those) auto-resets
  // once nothing has happened for 10 minutes.
  useEffect(() => {
    if (resumeId || status !== "bot" || messages.length === 0) return;
    const lastActivity = new Date(messages[messages.length - 1].created_at).getTime();
    const remaining = INACTIVITY_ARCHIVE_MS - (Date.now() - lastActivity);
    const timer = setTimeout(() => setRefreshKey((k) => k + 1), Math.max(remaining, 0));
    return () => clearTimeout(timer);
  }, [resumeId, status, messages]);

  // Without this, an admin's reply (or the bot handing off) only ever
  // showed up on the next manual reload — the page fetched history once on
  // mount and never again. Same pattern as messages/community_messages:
  // explicitly set Realtime's websocket auth before subscribing.
  useEffect(() => {
    if (!conversationId) return;
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;

    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (cancelled || !session) return;
      supabase.realtime.setAuth(session.access_token);

      channel = supabase
        .channel(`support_messages:${conversationId}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "support_messages", filter: `conversation_id=eq.${conversationId}` },
          (payload) => {
            const incoming = payload.new as SupportMessage;
            setMessages((prev) => (prev.some((m) => m.id === incoming.id) ? prev : [...prev, incoming]));
          },
        )
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "support_conversations", filter: `id=eq.${conversationId}` },
          (payload) => {
            const updated = payload.new as { status: "bot" | "escalated" | "closed" };
            setStatus(updated.status);
          },
        )
        .subscribe();
    })();

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, [conversationId]);

  const send = async (body: string) => {
    if (!body.trim() || isSending || !conversationId) return;
    setIsSending(true);
    setSendError(null);
    setDraft("");
    pendingIdRef.current += 1;
    const optimisticUser: SupportMessage = {
      id: `pending-${pendingIdRef.current}`,
      sender: "user",
      kind: "text",
      body: body.trim(),
      attachment_url: null,
      attachment_name: null,
      attachment_type: null,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticUser]);

    try {
      const res = await fetch("/api/support-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, message: body.trim() }),
      });
      if (!res.ok) throw new Error("request failed");
      const data = await res.json();
      setMessages((prev) => {
        const withoutOptimistic = prev.filter((m) => m.id !== optimisticUser.id);
        return [...withoutOptimistic, ...(data.userMessage ? [data.userMessage] : [optimisticUser]), ...(data.botMessage ? [data.botMessage] : [])];
      });
      if (data.escalated) setStatus("escalated");
    } catch {
      setSendError("Le message n'a pas pu être envoyé, réessayez.");
    } finally {
      setIsSending(false);
    }
  };

  const sendAttachment = async (file: File) => {
    if (isUploading || isSending || !conversationId) return;
    setIsUploading(true);
    setSendError(null);

    const { url, name, type, error: uploadError } = await uploadSupportAttachment(file);
    if (uploadError || !url) {
      setSendError(uploadError?.message || "Le fichier n'a pas pu être envoyé, réessayez.");
      setIsUploading(false);
      return;
    }

    pendingIdRef.current += 1;
    const optimisticUser: SupportMessage = {
      id: `pending-${pendingIdRef.current}`,
      sender: "user",
      kind: "attachment",
      body: null,
      attachment_url: url,
      attachment_name: name,
      attachment_type: type,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticUser]);
    setIsUploading(false);
    setIsSending(true);

    try {
      const res = await fetch("/api/support-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, attachment: { url, name, type } }),
      });
      if (!res.ok) throw new Error("request failed");
      const data = await res.json();
      setMessages((prev) => {
        const withoutOptimistic = prev.filter((m) => m.id !== optimisticUser.id);
        return [...withoutOptimistic, ...(data.userMessage ? [data.userMessage] : [optimisticUser]), ...(data.botMessage ? [data.botMessage] : [])];
      });
      if (data.escalated) setStatus("escalated");
    } catch {
      setSendError("Le fichier n'a pas pu être envoyé, réessayez.");
    } finally {
      setIsSending(false);
    }
  };

  const showSuggestions = !isLoading && messages.length <= 1 && status === "bot";
  // The most recent admin reply's name — once someone's actually answered,
  // the header should say who, not the generic placeholder, and the "a
  // human has been notified" banner (below) no longer applies.
  const adminName = [...messages].reverse().find((m) => m.sender === "admin")?.sender_name || null;

  return (
    <div className="bg-background text-on-background font-body-md antialiased">
      <header className="glass-header fixed top-0 inset-x-0 z-50 flex items-center justify-between px-container-margin min-h-14 pt-[env(safe-area-inset-top)] shadow-sm">
        <Link href="/help" className="text-primary hover:opacity-70 transition-opacity active:scale-95 flex items-center justify-center w-10 h-10 -ml-2 rounded-full">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>arrow_back_ios</span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-variant flex items-center justify-center text-primary">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                {status === "escalated" ? "support_agent" : "smart_toy"}
              </span>
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-surface rounded-full" />
          </div>
          <div className="flex flex-col">
            <h1 className="font-headline-sm text-headline-sm text-on-surface">
              {status === "escalated" ? adminName || "Conseiller Objely" : "Assistant Objely"}
            </h1>
            <span className="font-label-md text-[11px] text-outline">
              {status === "escalated" ? (adminName ? "Conseiller humain" : "Un conseiller va vous répondre") : "Répond instantanément"}
            </span>
          </div>
        </div>
        <div className="w-10" />
      </header>

      <main className="min-h-screen max-w-[800px] mx-auto px-container-margin py-md pt-[calc(92px+env(safe-area-inset-top))] pb-[140px] flex flex-col gap-md">
        {isLoading && (
          <div className="flex justify-center py-xl">
            <span className="w-8 h-8 border-4 border-primary-container/30 border-t-primary rounded-full animate-spin" />
          </div>
        )}

        {loadError && (
          <div className="flex flex-col items-center text-center py-xl gap-3">
            <p className="font-body-md text-body-md text-on-surface-variant">
              La conversation n&apos;a pas pu être chargée.
            </p>
            <Link href="/help" className="text-primary font-semibold">
              Retour à l&apos;aide
            </Link>
          </div>
        )}

        {!loadError && messages.map((message) => {
          const isMine = message.sender === "user";
          return (
            <div key={message.id} className={`flex flex-col gap-1 max-w-[85%] ${isMine ? "items-end self-end" : "items-start self-start"}`}>
              <div
                className={`rounded-2xl overflow-hidden shadow-sm ${
                  message.kind === "attachment" ? "p-1.5" : "px-4 py-2.5 whitespace-pre-line"
                } ${isMine ? "message-out text-on-primary" : "bg-surface-container message-in text-on-surface"}`}
              >
                {message.kind === "attachment" ? (
                  message.attachment_type?.startsWith("image/") ? (
                    <a href={message.attachment_url ?? undefined} target="_blank" rel="noopener noreferrer" className="block relative w-52 h-40 rounded-xl overflow-hidden">
                      <Image src={message.attachment_url ?? ""} alt={message.attachment_name ?? "Pièce jointe"} fill sizes="208px" className="object-cover" />
                    </a>
                  ) : (
                    <a
                      href={message.attachment_url ?? undefined}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl ${isMine ? "bg-white/10" : "bg-surface-container-high"}`}
                    >
                      <span className="material-symbols-outlined text-[22px] shrink-0">{attachmentIcon(message.attachment_type)}</span>
                      <span className="font-body-md text-body-md truncate max-w-[160px]">{message.attachment_name ?? "Pièce jointe"}</span>
                      <span className="material-symbols-outlined text-[18px] shrink-0">download</span>
                    </a>
                  )
                ) : (
                  <p className="font-body-md text-body-md">{message.body}</p>
                )}
              </div>
              <span className={`font-label-md text-[11px] text-outline-variant ${isMine ? "mr-2" : "ml-2"}`}>{formatTime(message.created_at)}</span>
            </div>
          );
        })}

        {status === "escalated" && !adminName && (
          <div className="bg-secondary/10 text-secondary rounded-2xl px-4 py-3 text-center font-body-md text-[13px] mx-auto">
            Un conseiller humain a été prévenu et prendra le relais ici dès que possible.
          </div>
        )}

        {showSuggestions && (
          <div className="flex flex-col gap-2 items-start">
            {SUGGESTIONS.map((s) => (
              <button
                key={s.label}
                onClick={() => send(s.label)}
                disabled={isSending}
                className="bg-surface-container-lowest text-primary border border-outline-variant/40 rounded-full px-4 py-2 flex items-center gap-2 hover:bg-primary/5 active:scale-95 transition-all shadow-sm disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">{s.icon}</span>
                <span className="font-label-md text-label-md">{s.label}</span>
              </button>
            ))}
          </div>
        )}

        {isSending && (
          <div className="flex items-center gap-1 self-start bg-surface-container rounded-2xl px-4 py-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        )}

        <div ref={bottomRef} />
      </main>

      <footer className="glass-input fixed bottom-0 inset-x-0 z-50 p-3 safe-area-pb">
        {sendError && (
          <p className="font-body-md text-[13px] text-error text-center mb-2 max-w-[800px] mx-auto">{sendError}</p>
        )}
        <div className="flex items-end gap-2 max-w-[800px] mx-auto w-full">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf,.doc,.docx,.txt"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (file) sendAttachment(file);
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || isSending || isLoading}
            aria-label="Joindre un fichier"
            className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors shrink-0 disabled:opacity-50"
          >
            {isUploading ? (
              <span className="w-[26px] h-[26px] flex items-center justify-center">
                <span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              </span>
            ) : (
              <span className="material-symbols-outlined text-[26px]" style={{ fontVariationSettings: "'FILL' 0" }}>add_circle</span>
            )}
          </button>
          <div className="flex-1 bg-surface-container-low rounded-3xl border border-outline-variant/30 px-4 py-2 flex items-center min-h-[44px]">
            <textarea
              ref={textareaRef}
              className="w-full bg-transparent border-none p-0 focus:ring-0 resize-none font-body-md text-body-md text-on-surface placeholder-outline max-h-32"
              placeholder="Écrire un message..."
              rows={1}
              value={draft}
              disabled={isLoading}
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
                  send(draft);
                }
              }}
            />
          </div>
          <button
            type="button"
            onClick={() => send(draft)}
            disabled={!draft.trim() || isSending || isLoading}
            className="p-2 bg-primary text-on-primary rounded-full hover:opacity-90 transition-opacity shrink-0 shadow-sm flex items-center justify-center h-11 w-11 disabled:opacity-50"
          >
            <span className="material-symbols-outlined ml-1" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
          </button>
        </div>
      </footer>
    </div>
  );
}

export default function HelpChatPage() {
  return (
    <Suspense fallback={null}>
      <HelpChatContent />
    </Suspense>
  );
}
