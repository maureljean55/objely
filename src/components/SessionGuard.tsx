"use client";

import { useEffect } from "react";
import { enforceRememberMe } from "@/lib/auth";

export default function SessionGuard() {
  useEffect(() => {
    enforceRememberMe();
  }, []);

  return null;
}
