"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const SUGGESTIONS = [
  { icon: "search", label: "Problème avec une correspondance" },
  { icon: "package_2", label: "Problème avec un objet" },
  { icon: "help", label: "Comment déclarer un objet ?" },
];

type SupportMessage = {
  id: string;
  sender: "user" | "bot" | "admin";
  body: string;
  created_at: string;
};

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const pendingIdRef = useRef(0);

  useEffect(() => {
    const url = resumeId ? `/api/support-chat?conversation=${resumeId}` : "/api/support-chat";
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.conversation) {
          setConversationId(data.conversation.id);
          setStatus(data.conversation.status);
        }
        setMessages(data.messages ?? []);
        setIsLoading(false);
      });
  }, [resumeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (body: string) => {
    if (!body.trim() || isSending || !conversationId) return;
    setIsSending(true);
    setDraft("");
    pendingIdRef.current += 1;
    const optimisticUser: SupportMessage = {
      id: `pending-${pendingIdRef.current}`,
      sender: "user",
      body: body.trim(),
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticUser]);

    const res = await fetch("/api/support-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId, message: body.trim() }),
    });
    const data = await res.json();
    setMessages((prev) => {
      const withoutOptimistic = prev.filter((m) => m.id !== optimisticUser.id);
      return [...withoutOptimistic, ...(data.userMessage ? [data.userMessage] : [optimisticUser]), ...(data.botMessage ? [data.botMessage] : [])];
    });
    if (data.escalated) setStatus("escalated");
    setIsSending(false);
  };

  const showSuggestions = !isLoading && messages.length <= 1 && status === "bot";

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
            <h1 className="font-headline-sm text-headline-sm text-on-surface">{status === "escalated" ? "Conseiller Objely" : "Assistant Objely"}</h1>
            <span className="font-label-md text-[11px] text-outline">
              {status === "escalated" ? "Un conseiller va vous répondre" : "Répond instantanément"}
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

        {messages.map((message) => {
          const isMine = message.sender === "user";
          return (
            <div key={message.id} className={`flex flex-col gap-1 max-w-[85%] ${isMine ? "items-end self-end" : "items-start self-start"}`}>
              <div
                className={`rounded-2xl px-4 py-2.5 shadow-sm whitespace-pre-line ${
                  isMine ? "message-out text-on-primary" : "bg-surface-container message-in text-on-surface"
                }`}
              >
                <p className="font-body-md text-body-md">{message.body}</p>
              </div>
              <span className={`font-label-md text-[11px] text-outline-variant ${isMine ? "mr-2" : "ml-2"}`}>{formatTime(message.created_at)}</span>
            </div>
          );
        })}

        {status === "escalated" && (
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
        <div className="flex items-end gap-2 max-w-[800px] mx-auto w-full">
          <button className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors shrink-0">
            <span className="material-symbols-outlined text-[26px]" style={{ fontVariationSettings: "'FILL' 0" }}>add_circle</span>
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
