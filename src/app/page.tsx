"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const ORBIT_OBJECTS = [
  { id: "wallet", src: "/illustrations/splash/wallet.png", alt: "Portefeuille", angle: 0 },
  { id: "phone", src: "/illustrations/splash/phone.png", alt: "Téléphone", angle: 90 },
  { id: "keys", src: "/illustrations/splash/keys.png", alt: "Clés", angle: 180 },
  { id: "earbuds", src: "/illustrations/splash/earbuds.png", alt: "Écouteurs", angle: 270 },
] as const;

const ORBIT_RADIUS = 120;

export default function SplashPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => router.replace("/login"), 2800);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div
      className="relative min-h-[100dvh] flex flex-col overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0058bc 0%, #0070eb 35%, #7c6ff0 70%, #a19afd 100%)" }}
    >
      <div className="flex-1 flex items-center justify-center">
        <div className="relative w-[280px] h-[280px] flex items-center justify-center">
          {/* Radar pings behind the magnifier */}
          <span className="absolute w-24 h-24 rounded-full border border-blue-200/40 radar-ping" />
          <span className="absolute w-24 h-24 rounded-full border border-blue-200/40 radar-ping" style={{ animationDelay: "1.3s" }} />

          {/* Orbiting object photos */}
          <div className="orbit-ring absolute inset-0">
            {ORBIT_OBJECTS.map((obj) => (
              <div
                key={obj.id}
                className="absolute top-1/2 left-1/2 w-14 h-14 -mt-7 -ml-7"
                style={{ transform: `rotate(${obj.angle}deg) translate(${ORBIT_RADIUS}px) rotate(-${obj.angle}deg)` }}
              >
                <div className="orbit-item-inner w-full h-full flex items-center justify-center drop-shadow-[0_6px_14px_rgba(0,0,0,0.45)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={obj.src} alt={obj.alt} className="max-w-full max-h-full object-contain" />
                </div>
              </div>
            ))}
          </div>

          {/* Magnifying glass */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/illustrations/splash/magnifier.png"
            alt=""
            className="magnifier-pulse relative w-32 select-none pointer-events-none"
            draggable={false}
          />
        </div>
      </div>

      <div
        className="splash-fade-up flex flex-col items-center pb-12"
        style={{ animationDelay: "0.15s", paddingBottom: "calc(3rem + env(safe-area-inset-bottom))" }}
      >
        <h1 className="font-headline-lg text-headline-lg text-white tracking-tight">Objely</h1>
        <p className="font-body-md text-body-md text-blue-200/80 mt-1">Perdu. Trouvé. Retrouvé.</p>
      </div>
    </div>
  );
}
