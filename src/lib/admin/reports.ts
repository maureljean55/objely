import { createAdminSupabaseClient } from "@/lib/admin/supabaseAdmin";
import type { ProblemCategory } from "@/lib/supabase/reports";

export type AdminProblemReport = {
  id: string;
  category: ProblemCategory;
  description: string;
  created_at: string;
  resolved_at: string | null;
  resolved_by: string | null;
  reporter: { full_name: string | null; public_id: string } | null;
  item: { title: string } | null;
};

export async function listProblemReports(): Promise<AdminProblemReport[]> {
  const admin = createAdminSupabaseClient();
  if (!admin) return [];

  const { data: reports, error } = await admin
    .from("problem_reports")
    .select("id, category, description, created_at, resolved_at, resolved_by, reporter_id, items(title)")
    .order("created_at", { ascending: false });

  if (error || !reports) {
    console.error("Failed to load problem_reports", error);
    return [];
  }

  const reporterIds = [...new Set(reports.map((r) => r.reporter_id))];
  const { data: profiles } = reporterIds.length
    ? await admin.from("profiles").select("id, full_name, public_id").in("id", reporterIds)
    : { data: [] as { id: string; full_name: string | null; public_id: string }[] };

  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));

  return reports.map((r) => {
    const item = Array.isArray(r.items) ? r.items[0] : r.items;
    const reporter = profileById.get(r.reporter_id) ?? null;
    return {
      id: r.id,
      category: r.category,
      description: r.description,
      created_at: r.created_at,
      resolved_at: r.resolved_at,
      resolved_by: r.resolved_by,
      reporter: reporter ? { full_name: reporter.full_name, public_id: reporter.public_id } : null,
      item: item ? { title: item.title } : null,
    };
  });
}
