import { requireAdminSession } from "@/lib/admin/auth";
import { listIdentityVerifications } from "@/lib/admin/identityVerifications";
import AdminShell from "@/components/admin/AdminShell";
import IdentityVerificationsList from "@/components/admin/IdentityVerificationsList";

export default async function AdminIdentityVerificationsPage() {
  const session = await requireAdminSession();
  const verifications = await listIdentityVerifications();

  return (
    <AdminShell title="Vérification d'identité" adminName={session.fullName}>
      <IdentityVerificationsList verifications={verifications} />
    </AdminShell>
  );
}
