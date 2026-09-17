"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";

export default function GuardedActionLink({
  href,
  authenticated,
  message,
  className,
  style,
  children,
}: {
  href: string;
  authenticated: boolean;
  message: string;
  className?: string;
  style?: React.CSSProperties;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  if (authenticated) {
    return (
      <Link href={href} className={className} style={style}>
        {children}
      </Link>
    );
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className} style={style}>
        {children}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-[2px]" onClick={() => setOpen(false)} />
          <div className="fixed inset-x-6 top-1/2 -translate-y-1/2 z-[71] max-w-sm mx-auto animate-popIn">
            <div
              className="relative overflow-hidden rounded-[28px] p-lg flex flex-col items-center text-center gap-3"
              style={{
                background: "linear-gradient(150deg, #ffffff 0%, #f4f1ff 60%, #eef1ff 100%)",
                boxShadow: "0 24px 50px -16px rgba(79, 70, 229, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.7)",
              }}
            >
              <div
                className="pointer-events-none absolute rounded-full blur-2xl opacity-25"
                style={{ width: 180, height: 180, top: -60, left: -50, background: "linear-gradient(135deg, #5b8cff, #c084fc)" }}
              />
              <span
                className="relative w-14 h-14 rounded-full flex items-center justify-center shrink-0"
                style={{
                  background: "linear-gradient(150deg, #5b8cff 0%, #8b5cf6 60%, #c084fc 100%)",
                  boxShadow: "0 10px 20px -6px rgba(101, 80, 232, 0.55)",
                }}
              >
                <Image src="/illustrations/home/mascot.png" alt="" width={40} height={40} className="object-contain" />
              </span>
              <h3 className="relative font-headline-sm text-headline-sm text-on-surface font-extrabold">Oups !</h3>
              <p className="relative font-body-md text-body-md text-on-surface-variant">{message}</p>
              <div className="relative flex gap-2 w-full mt-1">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 py-2.5 rounded-full font-label-md text-label-md text-on-surface-variant hover:bg-black/[0.04] transition-colors"
                >
                  Plus tard
                </button>
                <Link
                  href="/register"
                  className="flex-1 py-2.5 rounded-full font-label-md text-label-md text-white text-center transition-transform active:scale-95"
                  style={{
                    background: "linear-gradient(90deg, #1d3fd6, #7c3aed)",
                    boxShadow: "0 10px 22px -8px rgba(37, 52, 220, 0.55)",
                  }}
                >
                  S&apos;inscrire
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
