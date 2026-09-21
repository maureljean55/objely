import { notFound } from "next/navigation";
import { requireAdminSession } from "@/lib/admin/auth";
import { getSupportConversation } from "@/lib/admin/support";
import AdminShell from "@/components/admin/AdminShell";
import SupportConversationThread from "@/components/admin/SupportConversationThread";

export default async function AdminSupportConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession();
  const { id } = await params;
  const { conversation, messages } = await getSupportConversation(id);
  if (!conversation) notFound();

  return (
    <AdminShell title="Support" adminName={session.fullName}>
      <SupportConversationThread conversation={conversation} initialMessages={messages} />
    </AdminShell>
  );
}
