import { requireAdminSession } from "@/lib/admin/auth";
import { listProblemReports } from "@/lib/admin/reports";
import AdminShell from "@/components/admin/AdminShell";
import ReportsList from "@/components/admin/ReportsList";

export default async function AdminSignalementsPage() {
  const session = await requireAdminSession();
  const reports = await listProblemReports();

  return (
    <AdminShell title="Signalements" adminName={session.fullName}>
      <ReportsList reports={reports} />
    </AdminShell>
  );
}
