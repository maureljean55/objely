"use client";

import { useState } from "react";
import Link from "next/link";
import type { AdminSupportConversation } from "@/lib/admin/support";

const STATUS_LABEL: Record<AdminSupportConversation["status"], { label: string; className: string }> = {
  bot: { label: "Bot", className: "bg-surface-container text-on-surface-variant" },
  escalated: { label: "En attente d'un conseiller", className: "bg-error-container text-on-error-container" },
  closed: { label: "Clôturée", className: "bg-surface-container text-on-surface-variant" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" });
}

export default function SupportConversationList({ conversations }: { conversations: AdminSupportConversation[] }) {
  const [filter, setFilter] = useState<"escalated" | "all">("escalated");

  const visible = conversations.filter((c) => (filter === "escalated" ? c.status === "escalated" : true));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        {(["escalated", "all"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full font-label-md text-label-md transition-colors ${
              filter === f ? "bg-primary text-on-primary" : "bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container"
            }`}
          >
            {f === "escalated" ? "En attente" : "Toutes"}
          </button>
        ))}
      </div>

      {visible.length === 0 && (
        <p className="font-body-md text-body-md text-on-surface-variant py-12 text-center">
          Aucune conversation dans cette catégorie.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {visible.map((conversation) => {
          const status = STATUS_LABEL[conversation.status];
          return (
            <Link
              key={conversation.id}
              href={`/admin/support/${conversation.id}`}
              className="bg-surface-container-lowest rounded-xl soft-shadow p-4 flex flex-col gap-2 hover:bg-surface-container transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2 py-0.5 rounded-full font-label-md text-label-md ${status.className}`}>{status.label}</span>
                  <span className="font-body-md text-body-md text-on-surface-variant">
                    {conversation.user ? `${conversation.user.full_name ?? "Utilisateur"} (@${conversation.user.public_id})` : "Utilisateur supprimé"}
                  </span>
                </div>
                <span className="font-body-md text-body-md text-on-surface-variant shrink-0">{formatDate(conversation.updated_at)}</span>
              </div>
              {conversation.last_message_body && (
                <p className="font-body-lg text-body-lg text-on-surface truncate">{conversation.last_message_body}</p>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
