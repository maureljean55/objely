import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { CommunityLastMessage, CommunityWithCount } from "@/lib/supabase/communities";
import CommunitiesBrowser from "./CommunitiesBrowser";

export const metadata: Metadata = {
  title: "Communautés",
  description: "Rejoignez ou créez une communauté de déclarants près de chez vous sur Objely.",
};

export default async function CommunitiesPage() {
  const supabase = await createClient();
  // Middleware already validated/refreshed the session for this request, so
  // reading it back here doesn't need a second round trip to Supabase's
  // Auth server.
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user ?? null;

  // The directory is open to everyone (see communities' RLS), signed in or
  // not — same growth-oriented precedent as public found items.
  const { data: allCommunities } = await supabase
    .from("communities_with_counts")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<CommunityWithCount[]>();

  let myCommunities: CommunityWithCount[] = [];
  let lastMessages: CommunityLastMessage[] = [];
  let weeklyRecoveredCount = 0;
  if (user) {
    const [{ data: memberships }, { data: lastMessageRows }, { data: weeklyCount }] = await Promise.all([
      supabase.from("community_members").select("community_id").eq("user_id", user.id),
      supabase.rpc("list_my_communities_with_last_message"),
      supabase.rpc("my_communities_weekly_recovered_count").maybeSingle<number>(),
    ]);
    const myIds = new Set((memberships ?? []).map((m) => m.community_id));
    myCommunities = (allCommunities ?? []).filter((c) => myIds.has(c.id));
    lastMessages = (lastMessageRows ?? []) as CommunityLastMessage[];
    weeklyRecoveredCount = weeklyCount ?? 0;
  }

  return (
    <div className="bg-background text-on-surface antialiased min-h-screen pb-24">
      <header className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-container-margin min-h-14 pt-[env(safe-area-inset-top)] bg-surface/80 backdrop-blur-xl border-b border-outline-variant/30">
        <Link
          href="/home"
          aria-label="Retour"
          className="w-10 h-10 flex items-center justify-center text-primary hover:opacity-70 transition-opacity active:scale-95"
        >
          <span className="material-symbols-outlined">arrow_back_ios</span>
        </Link>
        <h1 className="font-headline-sm text-headline-sm text-on-surface absolute left-1/2 -translate-x-1/2">Communautés</h1>
        <div className="w-10 h-10" />
      </header>

      <main className="max-w-[800px] mx-auto pt-[calc(5rem+env(safe-area-inset-top))] pb-8 px-container-margin flex flex-col gap-lg">
        <CommunitiesBrowser
          allCommunities={allCommunities ?? []}
          myCommunities={myCommunities}
          lastMessages={lastMessages}
          weeklyRecoveredCount={weeklyRecoveredCount}
          authenticated={!!user}
        />
      </main>
    </div>
  );
}
