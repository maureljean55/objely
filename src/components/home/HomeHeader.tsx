"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Greeting from "@/components/home/Greeting";
import styles from "@/app/home/home.module.css";

const COMPACT_THRESHOLD = 24;

export default function HomeHeader({
  avatarUrl,
  fullName,
  unreadCount,
}: {
  avatarUrl: string | null;
  fullName: string | null;
  unreadCount: number;
}) {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const handleScroll = () => setCompact(window.scrollY > COMPACT_THRESHOLD);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`${styles.header} ${compact ? styles.headerCompact : ""}`}>
      <div className={styles.headerLeft}>
        <Link href="/profile" aria-label="Profil" className={styles.profileButton}>
          {avatarUrl ? (
            <Image src={avatarUrl} alt="Profil" width={52} height={52} />
          ) : (
            <span className="material-symbols-outlined" style={{ fontSize: 26, fontVariationSettings: "'FILL' 1" }}>
              person
            </span>
          )}
        </Link>
        {!compact && <Greeting fullName={fullName} className={styles.greeting} />}
      </div>

      <div className={styles.headerRight}>
        <Link href="/notifications" aria-label="Notifications" className={styles.circleButton}>
          <span className="material-symbols-outlined">notifications</span>
          {!!unreadCount && <i className={styles.notificationDot} />}
        </Link>

        <Link href="/qr" aria-label="Scanner un QR code" className={styles.circleButton}>
          <span className="material-symbols-outlined">qr_code_scanner</span>
        </Link>
      </div>
    </header>
  );
}
