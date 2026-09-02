"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const ORBIT_OBJECTS = [
  { id: "wallet", src: "/illustrations/splash/wallet.jpg", alt: "Portefeuille", angle: 0 },
  { id: "phone", src: "/illustrations/splash/phone.jpg", alt: "Téléphone", angle: 90 },
  { id: "keys", src: "/illustrations/splash/keys.jpg", alt: "Clés", angle: 180 },
  { id: "earbuds", src: "/illustrations/splash/earbuds.jpg", alt: "Écouteurs", angle: 270 },
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
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "radial-gradient(circle at 50% 38%, #4a7bfa 0%, #2f5de8 45%, #1230a8 100%)" }}
    >
      <div className="relative flex flex-col items-center">
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
                <div className="orbit-item-inner w-full h-full rounded-full overflow-hidden ring-2 ring-white/70 shadow-[0_6px_20px_rgba(0,0,0,0.35)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={obj.src} alt={obj.alt} className="w-full h-full object-cover" />
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

        <div className="splash-fade-up flex flex-col items-center mt-10" style={{ animationDelay: "0.15s" }}>
          <h1 className="font-headline-lg text-headline-lg text-white tracking-tight">Objely</h1>
          <p className="font-body-md text-body-md text-blue-200/80 mt-1">Perdu. Trouvé. Retrouvé.</p>
        </div>
      </div>
    </div>
  );
}
