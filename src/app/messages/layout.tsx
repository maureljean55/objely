import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Messages",
  description: "Vos conversations avec les autres utilisateurs Objely.",
};

export default async function MessagesLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  // The page itself (client component) previously just rendered an empty
  // conversation list for a signed-out visitor instead of sending them to
  // log in — not a data leak, but inconsistent with what this page implies.
  if (!session) redirect("/login?next=/messages");

  return children;
}
