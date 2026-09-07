import Link from "next/link";

export default function MessagesFab({ unreadCount }: { unreadCount: number }) {
  return (
    <Link
      href="/messages"
      aria-label={unreadCount > 0 ? `Messages, ${unreadCount} non lu${unreadCount > 1 ? "s" : ""}` : "Messages"}
      className="fixed z-40 bottom-[104px] right-4 md:bottom-8 md:right-8 w-14 h-14 rounded-full bg-primary text-on-primary shadow-xl flex items-center justify-center hover:opacity-90 active:scale-95 transition-all"
    >
      <span className="material-symbols-outlined text-[26px]" style={{ fontVariationSettings: "'FILL' 1" }}>
        chat_bubble
      </span>
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-error text-on-error font-label-md text-[11px] font-bold flex items-center justify-center border-2 border-background">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </Link>
  );
}
