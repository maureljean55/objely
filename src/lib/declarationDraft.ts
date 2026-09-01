export type DeclarationDraft = {
  categoryId?: string;
  categoryLabel?: string;
  categoryIcon?: string;
  objectName?: string;
  description?: string;
  brand?: string;
  color?: string;
  location?: string;
  date?: string;
};

const KEY = "objely-declaration-draft";

export function loadDraft(): DeclarationDraft {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(sessionStorage.getItem(KEY) ?? "{}");
  } catch {
    return {};
  }
}

export function saveDraft(patch: Partial<DeclarationDraft>) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(KEY, JSON.stringify({ ...loadDraft(), ...patch }));
}

export function clearDraft() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(KEY);
}
