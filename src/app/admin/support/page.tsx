import { requireAdminSession } from "@/lib/admin/auth";
import { listSupportConversations } from "@/lib/admin/support";
import AdminShell from "@/components/admin/AdminShell";
import SupportConversationList from "@/components/admin/SupportConversationList";

export default async function AdminSupportPage() {
  const session = await requireAdminSession();
  const conversations = await listSupportConversations();

  return (
    <AdminShell title="Support" adminName={session.fullName}>
      <SupportConversationList conversations={conversations} />
    </AdminShell>
  );
}
