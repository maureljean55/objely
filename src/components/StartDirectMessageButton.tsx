"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getOrCreateDirectConversation } from "@/lib/supabase/directMessages";

export default function StartDirectMessageButton({ otherUserId, className }: { otherUserId: string; className?: string }) {
  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false);

  const handleClick = async () => {
    setIsStarting(true);
    const { data: conversationId, error } = await getOrCreateDirectConversation(otherUserId);
    if (!error && conversationId) {
      router.push(`/dm/${conversationId}`);
      return;
    }
    setIsStarting(false);
  };

  return (
    <button type="button" onClick={handleClick} disabled={isStarting} className={className}>
      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>chat_bubble</span>
      {isStarting ? "Ouverture…" : "Envoyer un message"}
    </button>
  );
}
