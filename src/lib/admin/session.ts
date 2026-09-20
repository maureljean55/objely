import { createHmac, timingSafeEqual } from "crypto";

export const ADMIN_SESSION_COOKIE = "objely_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 12; // 12h — short-lived since there's no refresh flow yet.

export type AdminSessionPayload = {
  id: string;
  email: string;
  fullName: string;
  role: "admin" | "super_admin";
  exp: number;
};

function getSecret(): string | null {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    console.error("ADMIN_SESSION_SECRET is not set; admin login is disabled.");
    return null;
  }
  return secret;
}

function sign(value: string, secret: string): string {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

export function createAdminSessionToken(payload: Omit<AdminSessionPayload, "exp">): string | null {
  const secret = getSecret();
  if (!secret) return null;

  const fullPayload: AdminSessionPayload = { ...payload, exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS };
  const encoded = Buffer.from(JSON.stringify(fullPayload)).toString("base64url");
  const signature = sign(encoded, secret);
  return `${encoded}.${signature}`;
}

export function verifyAdminSessionToken(token: string | undefined | null): AdminSessionPayload | null {
  if (!token) return null;
  const secret = getSecret();
  if (!secret) return null;

  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;

  const expectedSignature = sign(encoded, secret);
  const a = Buffer.from(signature);
  const b = Buffer.from(expectedSignature);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString()) as AdminSessionPayload;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}
