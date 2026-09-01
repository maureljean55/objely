"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";

const MATCH_PERCENT = 96;
const RADIUS = 40;
const CIRCUMFERENCE = RADIUS * 2 * Math.PI;

export default function MatchingVerificationPage() {
  const [offset, setOffset] = useState(CIRCUMFERENCE);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOffset(CIRCUMFERENCE - (MATCH_PERCENT / 100) * CIRCUMFERENCE);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="font-body-md text-on-background min-h-screen pb-32 bg-background">
      <header className="fixed bg-background/80 backdrop-blur-md top-0 z-50 flex justify-between items-center w-full px-container-margin py-base max-w-7xl mx-auto">
        <div className="flex items-center gap-md">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-container inner-stroke shrink-0" />
          <h1 className="font-display text-display text-primary tracking-tight">Bonjour 👋</h1>
        </div>
        <button className="w-10 h-10 flex items-center justify-center rounded-full hover:opacity-80 transition-opacity active:scale-95 duration-200">
          <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 0" }}>notifications</span>
        </button>
      </header>

      <main className="pt-24 px-container-margin max-w-7xl mx-auto pb-xl">
        <div className="text-center mb-lg pt-md">
          <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-background mb-xs">
            🎉 Une correspondance possible !
          </h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant">Nous avons trouvé un objet qui ressemble fortement au vôtre.</p>
        </div>

        <div className="flex justify-center mb-xl relative">
          <div className="relative w-48 h-48 flex items-center justify-center">
            <svg className="w-full h-full absolute top-0 left-0" viewBox="0 0 100 100">
              <circle className="text-surface-container stroke-current" cx="50" cy="50" fill="transparent" r={RADIUS} strokeWidth="8" />
              <circle
                className="text-primary stroke-current"
                cx="50"
                cy="50"
                fill="transparent"
                r={RADIUS}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={offset}
                style={{
                  transform: "rotate(-90deg)",
                  transformOrigin: "50% 50%",
                  transition: "stroke-dashoffset 1s ease-in-out",
                }}
              />
            </svg>
            <div className="flex flex-col items-center justify-center z-10 bg-surface-container-lowest/80 backdrop-blur-md rounded-full w-32 h-32 inner-stroke soft-shadow">
              <span className="font-display text-display text-primary">{MATCH_PERCENT}%</span>
              <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest mt-1">Match</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-sm md:gap-gutter mb-xl">
          <div className="bg-surface-container-lowest rounded-[24px] soft-shadow inner-stroke flex flex-col overflow-hidden relative">
            <div className="absolute top-sm right-sm bg-error-container/90 backdrop-blur-sm px-2 py-1 rounded-full z-10 flex items-center gap-1 border border-error/20">
              <span className="material-symbols-outlined text-[12px] text-on-error-container">search</span>
              <span className="font-label-md text-[10px] text-on-error-container leading-none uppercase">Perdu</span>
            </div>
            <div className="h-32 md:h-48 w-full bg-surface-container relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="w-full h-full object-cover"
                alt="Mon portefeuille en cuir perdu"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuABkokfB-6YcPQUUtsM0pA1Pa6HZ13v6ZxMAAXI5_aqG-eGKPWWWVZCGB-cWIiJcKSWJAmaqI3LelDhhjzb3VnCf1KcNqB0mM2YZ_p2MCnWDE6hPsKSR3l6aqURBjMWvOm3PvspKMbBE5y_tC3IIeGHIr2DPXnBQl8pIDSd3GMwW_FjnM2hU-Tz4cTIUbv7WwsaN_ECxtteDsuKmmn3P2L8wPNX0VEZu3jy8Xd4zHZAQX4EEV6ViEw7"
              />
            </div>
            <div className="p-md grow flex flex-col justify-between">
              <div>
                <h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1">Mon objet perdu</h3>
                <p className="font-headline-sm text-headline-sm text-on-background mb-xs truncate">Portefeuille en cuir</p>
              </div>
              <div className="flex items-center gap-1 mt-sm text-outline">
                <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                <span className="font-body-md text-[12px] truncate">12 Oct 2023</span>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-[24px] soft-shadow inner-stroke flex flex-col overflow-hidden relative">
            <div className="absolute top-sm right-sm bg-primary-container/90 backdrop-blur-sm px-2 py-1 rounded-full z-10 flex items-center gap-1 border border-primary/20">
              <span className="material-symbols-outlined text-[12px] text-on-primary-container">check_circle</span>
              <span className="font-label-md text-[10px] text-on-primary-container leading-none uppercase">Trouvé</span>
            </div>
            <div className="h-32 md:h-48 w-full bg-surface-container relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="w-full h-full object-cover"
                alt="Portefeuille marron trouvé"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAuycBra52OqhjZjU2k7xhPsKCf8iRng8QTztYHnbpxk5qHviFrqjM_EvKxCVUYjddBZRzrnqPDKC4V5i6fhdRJUPYl3gOJ-t5neDyrGVI3_VAvRBHJTmxa1FpZvAiXbrXCOH3xpLv6aYqmUnCzOhf0PaCLISinlxe6lOswy4Xokn_j8x2rqeP2e_h5oQ0jWnynp9KtT9E6Gja5cfF0PhxEMzIeyh-RGVqyI7AgBDTGWPj_l6ceRno_"
              />
            </div>
            <div className="p-md grow flex flex-col justify-between">
              <div>
                <h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1">Objet trouvé</h3>
                <p className="font-headline-sm text-headline-sm text-on-background mb-xs truncate">Portefeuille marron</p>
              </div>
              <div className="flex items-center gap-1 mt-sm text-outline">
                <span className="material-symbols-outlined text-[16px]">location_on</span>
                <span className="font-body-md text-[12px] truncate">Gare Centrale</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-md">
          <Link
            href="/ownership-verification"
            className="w-full min-h-[56px] bg-primary btn-gradient text-on-primary font-headline-sm text-headline-sm rounded-[16px] shadow-sm hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 relative overflow-hidden group"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>handshake</span>
            Voir la correspondance
          </Link>
          <Link
            href="/search"
            className="w-full min-h-[56px] bg-surface-container-lowest text-primary font-headline-sm text-headline-sm rounded-[16px] border border-primary hover:bg-surface-container-lowest/80 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            Ce n&apos;est pas mon objet
          </Link>
        </div>
      </main>

      <BottomNav active="home" />
    </div>
  );
}
