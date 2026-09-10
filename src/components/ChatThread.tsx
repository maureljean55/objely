"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import Image from "next/image";

export type ChatMessage = {
  id: string;
  senderId: string;
  kind: "text" | "voice";
  body: string | null;
  voiceUrl: string | null;
  editedAt: string | null;
  deletedAt: string | null;
  createdAt: string;
  replyToId: string | null;
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

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function messagePreviewText(message: ChatMessage) {
  if (message.deletedAt) return "Message supprimé";
  if (message.kind === "voice") return "🎤 Note vocale";
  return message.body ?? "";
}

const LONG_PRESS_MS = 450;
const MENU_WIDTH = 200;
const MENU_MARGIN = 8;
const SWIPE_MAX = 72;
const SWIPE_THRESHOLD = 48;

function clampMenuPosition(x: number, y: number, rows: number) {
  if (typeof window === "undefined") return { left: x, top: y };
  const height = rows * 40 + 8;
  const left = Math.min(Math.max(x, MENU_MARGIN), window.innerWidth - MENU_WIDTH - MENU_MARGIN);
  const top = Math.min(Math.max(y, MENU_MARGIN), window.innerHeight - height - MENU_MARGIN);
  return { left, top };
}

function VoicePlayer({ url, isMine }: { url: string; isMine: boolean }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [loadError, setLoadError] = useState(false);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      return;
    }
    // play() returns a promise that rejects silently on autoplay-policy or
    // decode failures — without catching it, a failure here just does
    // nothing visible, which is exactly the "rien ne se passe" symptom.
    audio.play().catch(() => setLoadError(true));
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
        onLoadedMetadata={(e) => {
          const audio = e.currentTarget;
          // Chrome's MediaRecorder doesn't write a duration into the WebM
          // header (it isn't known until recording stops), so `duration`
          // reads as Infinity until the browser is forced to seek through
          // the whole file once — this is the standard workaround.
          if (!Number.isFinite(audio.duration)) {
            const fixDuration = () => {
              audio.currentTime = 0;
              audio.removeEventListener("timeupdate", fixDuration);
              setDuration(audio.duration || 0);
            };
            audio.addEventListener("timeupdate", fixDuration);
            audio.currentTime = 1e101;
          } else {
            setDuration(audio.duration);
          }
        }}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onError={() => setLoadError(true)}
        // Not `display:none` (Tailwind's `hidden`) — Safari/iOS can refuse
        // to play an <audio> element that was never actually laid out.
        // `sr-only` keeps it in the layout at 1x1px instead.
        className="sr-only"
      />
      <button
        type="button"
        disabled={loadError}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          // The bubble around this button listens for pointerdown/move to
          // recognize long-press and swipe-to-reply gestures — without
          // stopping propagation, a real finger tap (which always has a
          // little jitter) can be read as the start of that gesture and
          // the play button then never receives its click.
          e.stopPropagation();
          toggle();
        }}
        className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center disabled:opacity-50 ${isMine ? "bg-white/20 text-on-primary" : "bg-primary/10 text-primary"}`}
      >
        <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
          {loadError ? "error_outline" : isPlaying ? "pause" : "play_arrow"}
        </span>
      </button>
      {loadError ? (
        <span className={`font-body-md text-[13px] ${isMine ? "text-on-primary/80" : "text-on-surface-variant"}`}>
          Lecture impossible sur cet appareil
        </span>
      ) : (
        <div className="flex-1 flex flex-col gap-1">
          <div className={`h-1 rounded-full overflow-hidden ${isMine ? "bg-white/30" : "bg-primary/20"}`}>
            <div className={`h-full ${isMine ? "bg-white" : "bg-primary"}`} style={{ width: `${progress * 100}%` }} />
          </div>
          <span className={`font-label-md text-[11px] ${isMine ? "text-on-primary/80" : "text-on-surface-variant"}`}>
            {formatDuration(isPlaying || currentTime > 0 ? currentTime : duration)}
          </span>
        </div>
      )}
    </div>
  );
}

function MessageBubble({
  message,
  isMine,
  peerName,
  currentUserId,
  isMenuOpen,
  replyTarget,
  onLongPress,
  onContextMenu,
  onSwipeReply,
}: {
  message: ChatMessage;
  isMine: boolean;
  peerName: string;
  currentUserId: string | null;
  isMenuOpen: boolean;
  replyTarget: ChatMessage | null;
  onLongPress: (message: ChatMessage, x: number, y: number) => void;
  onContextMenu: (message: ChatMessage, x: number, y: number) => void;
  onSwipeReply: (message: ChatMessage) => void;
}) {
  const isDeleted = !!message.deletedAt;
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const gesture = useRef<{ startX: number; startY: number; mode: "none" | "swipe" | "scroll" } | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handlePointerDown = (e: ReactPointerEvent) => {
    if (isDeleted) return;
    gesture.current = { startX: e.clientX, startY: e.clientY, mode: "none" };
    clearLongPress();
    longPressTimer.current = setTimeout(() => onLongPress(message, e.clientX, e.clientY), LONG_PRESS_MS);
  };

  const handlePointerMove = (e: ReactPointerEvent) => {
    const g = gesture.current;
    if (!g || isDeleted) return;
    const dx = e.clientX - g.startX;
    const dy = e.clientY - g.startY;
    if (g.mode === "none") {
      if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        g.mode = "swipe";
        setIsDragging(true);
        clearLongPress();
      } else if (Math.abs(dy) > 10) {
        g.mode = "scroll";
        clearLongPress();
      }
    }
    if (g.mode === "swipe") {
      setDragX(Math.max(Math.min(dx, 0), -SWIPE_MAX));
    }
  };

  const endGesture = () => {
    clearLongPress();
    if (gesture.current?.mode === "swipe" && dragX <= -SWIPE_THRESHOLD) {
      onSwipeReply(message);
    }
    gesture.current = null;
    setIsDragging(false);
    setDragX(0);
  };

  return (
    <div className={`flex gap-2 max-w-[85%] ${isMine ? "self-end flex-row-reverse" : "self-start"}`}>
      <div
        className={`w-8 h-8 rounded-full overflow-hidden shrink-0 flex items-center justify-center ${
          isMine ? "bg-primary text-on-primary" : "bg-surface-container-highest text-on-surface-variant"
        }`}
      >
        <span className="font-label-md text-label-md">{isMine ? "Moi" : initials(peerName)}</span>
      </div>
      <div className="flex flex-col gap-1 min-w-0">
        <div className="relative">
          {!isDeleted && (
            <div
              className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none"
              style={{ opacity: Math.min(1, Math.abs(dragX) / SWIPE_THRESHOLD) }}
            >
              <span className="material-symbols-outlined text-primary text-[22px]">reply</span>
            </div>
          )}
          <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={endGesture}
            onPointerLeave={endGesture}
            onPointerCancel={endGesture}
            onContextMenu={(e) => {
              if (isDeleted) return;
              e.preventDefault();
              onContextMenu(message, e.clientX, e.clientY);
            }}
            style={{ transform: `translateX(${dragX}px)`, transition: isDragging ? "none" : "transform 200ms ease-out" }}
            className={`rounded-2xl px-4 py-2.5 shadow-sm select-none ${isMenuOpen ? "shadow-[0_0_0_4px_rgba(0,88,188,0.18)]" : ""} ${
              isDeleted
                ? "bg-surface-container-high text-on-surface-variant italic"
                : isMine
                  ? "message-out text-on-primary text-right"
                  : "bg-surface-container message-in text-on-surface"
            }`}
          >
            {!isDeleted && replyTarget && (
              <div className={`mb-1.5 rounded-md px-2 py-1 border-l-2 text-left ${isMine ? "bg-white/10 border-white/60" : "bg-black/5 border-primary"}`}>
                <span className={`block font-label-md text-[11px] font-semibold ${isMine ? "text-on-primary/90" : "text-primary"}`}>
                  {replyTarget.senderId === currentUserId ? "Vous" : peerName}
                </span>
                <span className={`block font-body-md text-[12px] truncate ${isMine ? "text-on-primary/70" : "text-on-surface-variant"}`}>
                  {messagePreviewText(replyTarget)}
                </span>
              </div>
            )}
            {isDeleted ? (
              <p className="font-body-md text-body-md">Message supprimé</p>
            ) : message.kind === "voice" && message.voiceUrl ? (
              <VoicePlayer url={message.voiceUrl} isMine={isMine} />
            ) : (
              <p className="font-body-md text-body-md whitespace-pre-wrap">{message.body}</p>
            )}
          </div>
        </div>
        <div className={`flex items-center gap-1 font-label-md text-[10px] text-outline px-1 ${isMine ? "justify-end" : "justify-start"}`}>
          <span>{formatTime(message.createdAt)}</span>
          {!isDeleted && message.editedAt && <span>· modifié</span>}
        </div>
      </div>
    </div>
  );
}

type Props = {
  peerName: string;
  peerAvatarUrl: string | null;
  currentUserId: string | null;
  messages: ChatMessage[];
  onSend: (body: string, replyToId: string | null) => Promise<boolean>;
  onSendVoice: (blob: Blob, replyToId: string | null) => Promise<boolean>;
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
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [menuMessage, setMenuMessage] = useState<ChatMessage | null>(null);
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isUploadingVoice, setIsUploadingVoice] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const recordingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const messagesById = new Map(messages.map((m) => [m.id, m]));

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    };
  }, []);

  const closeMenu = () => {
    setMenuMessage(null);
    setMenuPos(null);
  };

  const handleLongPress = (message: ChatMessage, x: number, y: number) => {
    const isOwn = message.senderId === currentUserId;
    const hasAnyAction = message.kind === "text" || isOwn;
    if (!hasAnyAction) return;
    setMenuMessage(message);
    setMenuPos({ x, y });
  };

  const handleSwipeReply = (message: ChatMessage) => {
    if (editingId) {
      setEditingId(null);
      setDraft("");
    }
    setReplyingTo(message);
    textareaRef.current?.focus();
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
    const sent = await onSend(body, replyingTo?.id ?? null);
    if (sent) {
      setReplyingTo(null);
    } else {
      setDraft(body);
    }
    setIsSending(false);
  };

  const startEditing = (message: ChatMessage) => {
    setEditingId(message.id);
    setDraft(message.body ?? "");
    setReplyingTo(null);
    closeMenu();
    textareaRef.current?.focus();
  };

  const cancelEditing = () => {
    setEditingId(null);
    setDraft("");
  };

  const handleCopy = async (message: ChatMessage) => {
    closeMenu();
    if (!message.body) return;
    try {
      await navigator.clipboard.writeText(message.body);
    } catch {
      // Clipboard access can be denied by the browser — nothing useful to
      // do about it beyond leaving the message as-is.
    }
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
        const sent = await onSendVoice(blob, replyingTo?.id ?? null);
        if (sent) setReplyingTo(null);
        setIsUploadingVoice(false);
      }
      chunksRef.current = [];
    };
    recorder.stop();
  };

  const menuIsOwn = menuMessage?.senderId === currentUserId;
  const menuRowCount = menuMessage ? (menuMessage.kind === "text" ? 1 : 0) + (menuIsOwn ? (menuMessage.kind === "text" ? 2 : 1) : 0) : 0;

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

        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isMine={message.senderId === currentUserId}
            peerName={peerName}
            currentUserId={currentUserId}
            isMenuOpen={menuMessage?.id === message.id}
            replyTarget={message.replyToId ? messagesById.get(message.replyToId) ?? null : null}
            onLongPress={handleLongPress}
            onContextMenu={handleLongPress}
            onSwipeReply={handleSwipeReply}
          />
        ))}
      </main>

      <footer className="glass-input fixed bottom-0 inset-x-0 z-50 p-3 safe-area-pb">
        <div className="max-w-7xl mx-auto w-full">
          {replyingTo && !editingId && (
            <div className="flex items-start gap-2 px-3 py-2 mb-1.5 bg-surface-container-high rounded-lg border-l-[3px] border-primary">
              <div className="flex-1 min-w-0">
                <span className="block font-label-md text-label-md text-primary font-semibold">
                  {replyingTo.senderId === currentUserId ? "Vous" : peerName}
                </span>
                <span className="block font-body-md text-body-md text-on-surface-variant truncate">{messagePreviewText(replyingTo)}</span>
              </div>
              <button type="button" onClick={() => setReplyingTo(null)} aria-label="Annuler la réponse" className="text-on-surface-variant p-1 shrink-0">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          )}

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
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-[100]" onClick={closeMenu}>
          <div
            className="absolute bg-surface-container-lowest/95 backdrop-blur-xl rounded-xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-outline-variant/15 py-1 origin-top-left animate-popIn"
            style={{ ...clampMenuPosition(menuPos.x, menuPos.y, menuRowCount), width: MENU_WIDTH }}
            onClick={(e) => e.stopPropagation()}
          >
            {menuMessage.kind === "text" && (
              <button
                type="button"
                onClick={() => handleCopy(menuMessage)}
                className="w-full py-2 px-3 flex items-center gap-2.5 text-on-surface font-body-md text-body-md hover:bg-surface-variant/40 active:bg-surface-variant/60 transition-colors"
              >
                <span className="material-symbols-outlined text-[19px] text-on-surface-variant w-5 shrink-0">content_copy</span>
                Copier
              </button>
            )}
            {menuIsOwn && menuMessage.kind === "text" && (
              <button
                type="button"
                onClick={() => startEditing(menuMessage)}
                className="w-full py-2 px-3 flex items-center gap-2.5 text-on-surface font-body-md text-body-md hover:bg-surface-variant/40 active:bg-surface-variant/60 transition-colors"
              >
                <span className="material-symbols-outlined text-[19px] text-on-surface-variant w-5 shrink-0">edit</span>
                Modifier
              </button>
            )}
            {menuIsOwn && (
              <button
                type="button"
                onClick={() => handleDelete(menuMessage)}
                className="w-full py-2 px-3 flex items-center gap-2.5 text-error font-body-md text-body-md hover:bg-surface-variant/40 active:bg-surface-variant/60 transition-colors"
              >
                <span className="material-symbols-outlined text-[19px] text-on-surface-variant w-5 shrink-0">delete</span>
                Supprimer
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
