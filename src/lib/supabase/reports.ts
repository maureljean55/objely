import { createClient } from "@/lib/supabase/client";

export type ProblemCategory = "tech" | "fake" | "info" | "other";

export const CATEGORY_LABELS: Record<ProblemCategory, string> = {
  tech: "Problème technique",
  fake: "Faux objet",
  info: "Mauvaise information",
  other: "Autre",
};

export async function submitProblemReport(category: ProblemCategory, description: string, itemId: string | null) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user ?? null;
  if (!user) return { error: new Error("Vous devez être connecté.") };

  const { error } = await supabase
    .from("problem_reports")
    .insert({ reporter_id: user.id, category, description: description.trim(), item_id: itemId });

  return { error };
}
