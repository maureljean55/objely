const AUTH_KEY = "objely-authenticated";

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(AUTH_KEY) === "true";
  } catch {
    return false;
  }
}

export function setAuthenticated() {
  try {
    localStorage.setItem(AUTH_KEY, "true");
  } catch {}
}
