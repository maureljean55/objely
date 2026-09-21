"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AdminSupportConversation, AdminSupportMessage } from "@/lib/admin/support";

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" });
}

const SENDER_LABEL: Record<AdminSupportMessage["sender"], string> = {
  user: "Utilisateur",
  bot: "Assistant",
  admin: "Conseiller",
};

export default function SupportConversationThread({
  conversation,
  initialMessages,
}: {
  conversation: AdminSupportConversation;
  initialMessages: AdminSupportMessage[];
}) {
  const router = useRouter();
  const [messages, setMessages] = useState(initialMessages);
  const [status, setStatus] = useState(conversation.status);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    const body = draft.trim();
    if (!body || isSending) return;
    setIsSending(true);
    setError(null);
    const res = await fetch(`/api/admin/support/${conversation.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    setIsSending(false);
    if (!res.ok) {
      setError("L'envoi a échoué, réessayez.");
      return;
    }
    const { message } = await res.json();
    setMessages((prev) => [...prev, message]);
    setStatus("escalated");
    setDraft("");
    router.refresh();
  };

  const handleToggleStatus = async () => {
    const action = status === "closed" ? "reopen" : "close";
    setIsTogglingStatus(true);
    setError(null);
    const res = await fetch(`/api/admin/support/${conversation.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setIsTogglingStatus(false);
    if (!res.ok) {
      setError("L'action a échoué, réessayez.");
      return;
    }
    setStatus(action === "close" ? "closed" : "escalated");
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <Link href="/admin/support" className="font-label-md text-label-md text-primary hover:opacity-70 transition-opacity">
          ← Retour
        </Link>
        <button
          onClick={handleToggleStatus}
          disabled={isTogglingStatus}
          className="font-label-md text-label-md px-3 py-1.5 rounded-full bg-surface-container-lowest hover:bg-surface-container text-on-surface soft-shadow transition-colors disabled:opacity-50"
        >
          {status === "closed" ? "Rouvrir" : "Clôturer"}
        </button>
      </div>

      <div className="bg-surface-container-lowest rounded-xl soft-shadow p-4">
        <p className="font-headline-sm text-headline-sm text-on-surface">
          {conversation.user ? conversation.user.full_name ?? "Utilisateur" : "Utilisateur supprimé"}
        </p>
        {conversation.user && <p className="font-body-md text-body-md text-on-surface-variant">@{conversation.user.public_id}</p>}
      </div>

      <div className="flex flex-col gap-3">
        {messages.map((message) => {
          const isUser = message.sender === "user";
          return (
            <div key={message.id} className={`flex flex-col gap-1 max-w-[70%] ${isUser ? "items-start self-start" : "items-end self-end"}`}>
              <span className="font-label-md text-label-md text-on-surface-variant px-1">
                {message.sender === "admin" ? message.sender_name || "Conseiller" : SENDER_LABEL[message.sender]}
              </span>
              <div
                className={`rounded-xl px-4 py-2.5 ${
                  isUser
                    ? "bg-surface-container text-on-surface"
                    : message.sender === "admin"
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container-high text-on-surface"
                }`}
              >
                {message.kind === "attachment" ? (
                  <a
                    href={message.attachment_url ?? undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline font-body-md text-body-md"
                  >
                    {message.attachment_name ?? "Pièce jointe"}
                  </a>
                ) : (
                  <p className="font-body-md text-body-md whitespace-pre-wrap">{message.body}</p>
                )}
              </div>
              <span className="font-label-md text-[11px] text-on-surface-variant px-1">{formatTime(message.created_at)}</span>
            </div>
          );
        })}
      </div>

      {error && <p className="font-body-md text-body-md text-error">{error}</p>}

      <div className="flex items-end gap-2 sticky bottom-0 bg-background pt-2">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          rows={2}
          placeholder="Répondre à l'utilisateur..."
          className="flex-1 bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-3 font-body-md text-body-md text-on-surface outline-none focus:ring-2 focus:ring-primary/20 resize-none"
        />
        <button
          onClick={handleSend}
          disabled={!draft.trim() || isSending}
          className="h-11 px-5 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          Envoyer
        </button>
      </div>
    </div>
  );
}
