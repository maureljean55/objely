"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export type ChatMessage = {
  id: string;
  senderId: string;
  kind: "text" | "voice";
  body: string | null;
  voiceUrl: string | null;
  editedAt: string | null;
  deletedAt: string | null;
};

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const LONG_PRESS_MS = 450;
const MENU_WIDTH = 200;
const MENU_MARGIN = 8;

function clampMenuPosition(x: number, y: number, rows: number) {
  if (typeof window === "undefined") return { left: x, top: y };
  const height = rows * 48;
  const left = Math.min(Math.max(x, MENU_MARGIN), window.innerWidth - MENU_WIDTH - MENU_MARGIN);
  const top = Math.min(Math.max(y, MENU_MARGIN), window.innerHeight - height - MENU_MARGIN);
  return { left, top };
}

function VoicePlayer({ url, isMine }: { url: string; isMine: boolean }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
  };

  const progress = duration > 0 ? Math.min(1, currentTime / duration) : 0;

  return (
    <div className="flex items-center gap-3 min-w-[180px]">
      <audio
        ref={audioRef}
        src={url}
        preload="metadata"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        className="hidden"
      />
      <button
        type="button"
        onClick={toggle}
        className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${isMine ? "bg-white/20 text-on-primary" : "bg-primary/10 text-primary"}`}
      >
        <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
          {isPlaying ? "pause" : "play_arrow"}
        </span>
      </button>
      <div className="flex-1 flex flex-col gap-1">
        <div className={`h-1 rounded-full overflow-hidden ${isMine ? "bg-white/30" : "bg-primary/20"}`}>
          <div className={`h-full ${isMine ? "bg-white" : "bg-primary"}`} style={{ width: `${progress * 100}%` }} />
        </div>
        <span className={`font-label-md text-[11px] ${isMine ? "text-on-primary/80" : "text-on-surface-variant"}`}>
          {formatDuration(isPlaying || currentTime > 0 ? currentTime : duration)}
        </span>
      </div>
    </div>
  );
}

type Props = {
  peerName: string;
  peerAvatarUrl: string | null;
  currentUserId: string | null;
  messages: ChatMessage[];
  onSend: (body: string) => Promise<boolean>;
  onSendVoice: (blob: Blob) => Promise<boolean>;
  onEdit: (messageId: string, body: string) => Promise<boolean>;
  onDelete: (messageId: string) => Promise<boolean>;
  onBack: () => void;
};

/** Shared chat UI for both match-based conversations and QR/direct conversations — same look regardless of what started the conversation. */
export default function ChatThread({
  peerName,
  peerAvatarUrl,
  currentUserId,
  messages,
  onSend,
  onSendVoice,
  onEdit,
  onDelete,
  onBack,
}: Props) {
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [menuMessage, setMenuMessage] = useState<ChatMessage | null>(null);
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);
  const pendingPos = useRef<{ x: number; y: number } | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isUploadingVoice, setIsUploadingVoice] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const recordingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    };
  }, []);

  const clearLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const startLongPress = (message: ChatMessage, x: number, y: number) => {
    if (message.senderId !== currentUserId || message.deletedAt) return;
    clearLongPress();
    pendingPos.current = { x, y };
    longPressTimer.current = setTimeout(() => {
      setMenuMessage(message);
      setMenuPos(pendingPos.current);
    }, LONG_PRESS_MS);
  };

  const closeMenu = () => {
    setMenuMessage(null);
    setMenuPos(null);
  };

  const handleSend = async () => {
    const body = draft.trim();
    if (!body || isSending) return;
    setIsSending(true);

    if (editingId) {
      const ok = await onEdit(editingId, body);
      if (ok) {
        setDraft("");
        setEditingId(null);
      }
      setIsSending(false);
      return;
    }

    setDraft("");
    const sent = await onSend(body);
    if (!sent) setDraft(body);
    setIsSending(false);
  };

  const startEditing = (message: ChatMessage) => {
    setEditingId(message.id);
    setDraft(message.body ?? "");
    closeMenu();
    textareaRef.current?.focus();
  };

  const cancelEditing = () => {
    setEditingId(null);
    setDraft("");
  };

  const handleDelete = async (message: ChatMessage) => {
    closeMenu();
    await onDelete(message.id);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      recordingIntervalRef.current = setInterval(() => setRecordingSeconds((s) => s + 1), 1000);
    } catch {
      // Permission denied or no microphone available — silently no-op,
      // the mic button simply won't start a recording.
    }
  };

  const stopRecording = (send: boolean) => {
    const recorder = mediaRecorderRef.current;
    if (!recorder) return;
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
    recorder.onstop = async () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setIsRecording(false);
      if (send && chunksRef.current.length > 0) {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        setIsUploadingVoice(true);
        await onSendVoice(blob);
        setIsUploadingVoice(false);
      }
      chunksRef.current = [];
    };
    recorder.stop();
  };

  return (
    <div className="bg-background text-on-background font-body-md antialiased">
      <header
        className="glass-header fixed top-0 inset-x-0 z-50 flex justify-between items-center w-full px-container-margin pb-base shadow-[0_1px_0_rgba(0,0,0,0.05)]"
        style={{ paddingTop: "calc(0.5rem + env(safe-area-inset-top))" }}
      >
        <button type="button" onClick={onBack} aria-label="Retour" className="text-primary p-2 -ml-2 rounded-full hover:bg-surface-container-high/50 transition-colors flex items-center">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>arrow_back_ios</span>
        </button>
        <div className="flex items-center gap-2">
          <div className="relative w-8 h-8 rounded-full overflow-hidden bg-surface-container-high flex items-center justify-center text-on-surface-variant shrink-0">
            {peerAvatarUrl ? (
              <Image alt={peerName} src={peerAvatarUrl} fill sizes="32px" className="object-cover" />
            ) : (
              <span className="material-symbols-outlined text-[18px]">person</span>
            )}
          </div>
          <h1 className="font-headline-sm text-headline-sm text-on-surface">{peerName}</h1>
        </div>
        <div className="w-9" />
      </header>

      <main className="min-h-screen px-container-margin py-md pt-[calc(92px+env(safe-area-inset-top))] pb-[140px] flex flex-col gap-md">
        <div className="bg-surface-container-high rounded-xl p-3 flex items-start gap-3 shadow-sm mx-auto max-w-sm mt-2 mb-4">
          <span className="material-symbols-outlined text-tertiary mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>security</span>
          <p className="font-label-md text-label-md text-on-surface-variant flex-1">
            Pour votre sécurité, <strong className="text-on-surface">ne partagez pas votre adresse personnelle</strong>. Privilégiez un lieu public en cas de rencontre.
          </p>
        </div>

        {messages.length === 0 && (
          <p className="font-body-md text-body-md text-on-surface-variant text-center">
            Aucun message pour le moment. Dites bonjour !
          </p>
        )}

        {messages.map((message) => {
          const isMine = message.senderId === currentUserId;
          const isDeleted = !!message.deletedAt;
          return (
            <div key={message.id} className={`flex gap-2 max-w-[85%] ${isMine ? "self-end flex-row-reverse" : "self-start"}`}>
              <div
                className={`w-8 h-8 rounded-full overflow-hidden shrink-0 flex items-center justify-center ${
                  isMine ? "bg-primary text-on-primary" : "bg-surface-container-highest text-on-surface-variant"
                }`}
              >
                <span className="font-label-md text-label-md">{isMine ? "Moi" : initials(peerName)}</span>
              </div>
              <div className="flex flex-col gap-1">
                <div
                  onPointerDown={(e) => startLongPress(message, e.clientX, e.clientY)}
                  onPointerUp={clearLongPress}
                  onPointerLeave={clearLongPress}
                  onPointerCancel={clearLongPress}
                  onContextMenu={(e) => {
                    if (message.senderId === currentUserId && !isDeleted) {
                      e.preventDefault();
                      setMenuMessage(message);
                      setMenuPos({ x: e.clientX, y: e.clientY });
                    }
                  }}
                  className={`rounded-2xl px-4 py-2.5 shadow-sm select-none transition-shadow duration-200 ${
                    menuMessage?.id === message.id ? "shadow-[0_0_0_4px_rgba(0,88,188,0.18)]" : ""
                  } ${
                    isDeleted
                      ? "bg-surface-container-high text-on-surface-variant italic"
                      : isMine
                        ? "message-out text-on-primary text-right"
                        : "bg-surface-container message-in text-on-surface"
                  }`}
                >
                  {isDeleted ? (
                    <p className="font-body-md text-body-md">Message supprimé</p>
                  ) : message.kind === "voice" && message.voiceUrl ? (
                    <VoicePlayer url={message.voiceUrl} isMine={isMine} />
                  ) : (
                    <p className="font-body-md text-body-md whitespace-pre-wrap">{message.body}</p>
                  )}
                </div>
                {!isDeleted && message.editedAt && (
                  <span className={`font-label-md text-[10px] text-outline ${isMine ? "text-right" : "text-left"}`}>modifié</span>
                )}
              </div>
            </div>
          );
        })}
      </main>

      <footer className="glass-input fixed bottom-0 inset-x-0 z-50 p-3 safe-area-pb">
        <div className="max-w-7xl mx-auto w-full">
          {editingId && (
            <div className="flex items-center justify-between px-3 py-1.5 mb-1.5 bg-surface-container-high rounded-lg">
              <span className="font-label-md text-label-md text-on-surface-variant">Modifier le message</span>
              <button type="button" onClick={cancelEditing} aria-label="Annuler la modification" className="text-on-surface-variant p-1">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          )}

          {isRecording ? (
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-surface-container-low rounded-xl border border-outline-variant/30 px-4 py-2 flex items-center gap-2 min-h-[44px]">
                <span className="w-2.5 h-2.5 rounded-full bg-error animate-pulse" />
                <span className="font-body-md text-body-md text-on-surface">{formatDuration(recordingSeconds)}</span>
                <span className="font-body-md text-body-md text-on-surface-variant ml-1">Enregistrement…</span>
              </div>
              <button
                type="button"
                onClick={() => stopRecording(false)}
                aria-label="Annuler l'enregistrement"
                className="p-2 bg-surface-container-highest text-on-surface-variant rounded-full shrink-0 flex items-center justify-center h-11 w-11"
              >
                <span className="material-symbols-outlined">delete</span>
              </button>
              <button
                type="button"
                onClick={() => stopRecording(true)}
                aria-label="Envoyer la note vocale"
                className="p-2 bg-primary text-on-primary rounded-full hover:opacity-90 transition-opacity shrink-0 shadow-sm flex items-center justify-center h-11 w-11"
              >
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
              </button>
            </div>
          ) : (
            <div className="flex items-end gap-2">
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
              {draft.trim() || editingId ? (
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!draft.trim() || isSending}
                  className="p-2 bg-primary text-on-primary rounded-full hover:opacity-90 transition-opacity shrink-0 shadow-sm flex items-center justify-center h-11 w-11 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined ml-1" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {editingId ? "check" : "send"}
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startRecording}
                  disabled={isUploadingVoice}
                  aria-label="Enregistrer une note vocale"
                  className="p-2 bg-primary text-on-primary rounded-full hover:opacity-90 transition-opacity shrink-0 shadow-sm flex items-center justify-center h-11 w-11 disabled:opacity-50"
                >
                  {isUploadingVoice ? (
                    <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>mic</span>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </footer>

      {menuMessage && menuPos && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-[100] bg-black/10 backdrop-blur-[1px]" onClick={closeMenu}>
          <div
            className="absolute bg-surface-container-lowest rounded-2xl overflow-hidden shadow-2xl border border-outline-variant/10 divide-y divide-surface-variant/50 origin-top-left animate-popIn"
            style={{ ...clampMenuPosition(menuPos.x, menuPos.y, menuMessage.kind === "text" ? 2 : 1), width: MENU_WIDTH }}
            onClick={(e) => e.stopPropagation()}
          >
            {menuMessage.kind === "text" && (
              <button
                type="button"
                onClick={() => startEditing(menuMessage)}
                className="w-full py-2.5 px-3 flex items-center gap-3 text-on-surface font-body-lg text-body-lg hover:bg-surface-variant/40 active:bg-surface-variant/60 transition-colors"
              >
                <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                </span>
                Modifier
              </button>
            )}
            <button
              type="button"
              onClick={() => handleDelete(menuMessage)}
              className="w-full py-2.5 px-3 flex items-center gap-3 text-error font-body-lg text-body-lg hover:bg-error-container/20 active:bg-error-container/30 transition-colors"
            >
              <span className="w-8 h-8 rounded-full bg-error/10 text-error flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[18px]">delete</span>
              </span>
              Supprimer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
