import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SuspendedSignOutButton from "@/components/suspended/SuspendedSignOutButton";

export default async function SuspendedPage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("suspended_at, suspended_reason")
    .eq("id", session.user.id)
    .maybeSingle<{ suspended_at: string | null; suspended_reason: string | null }>();

  // Not actually suspended (direct visit, or an admin just reactivated
  // them) — nothing to show here.
  if (!profile?.suspended_at) redirect("/home");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-container-margin relative overflow-hidden">
      <div className="blob-bg" />
      <div className="relative z-10 flex flex-col items-center max-w-sm gap-lg">
        <div className="w-20 h-20 rounded-full bg-error-container flex items-center justify-center">
          <span className="material-symbols-outlined text-[36px] text-error">block</span>
        </div>
        <div>
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-2">Compte suspendu</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Votre compte a été suspendu pour non-respect des règles d&apos;utilisation d&apos;Objely.
          </p>
          {profile.suspended_reason && (
            <p className="font-body-md text-body-md text-on-surface-variant bg-surface-container-lowest rounded-2xl px-4 py-3 mt-4">
              {profile.suspended_reason}
            </p>
          )}
          <p className="font-body-md text-body-md text-on-surface-variant mt-4">
            Vous ne pouvez plus utiliser l&apos;application. Si vous pensez qu&apos;il s&apos;agit d&apos;une erreur,{" "}
            <Link href="/help" className="text-primary font-semibold hover:underline">
              contactez notre support
            </Link>
            .
          </p>
        </div>
        <SuspendedSignOutButton />
      </div>
    </div>
  );
}
