import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import RestitutionConfirmPanel from "@/components/RestitutionConfirmPanel";
import { createClient } from "@/lib/supabase/server";
import type { Item } from "@/lib/supabase/items";

function declaredDateLabel(item: Item) {
  const verb = item.type === "lost" ? "Perdu" : "Trouvé";
  if (!item.occurred_on) return verb;
  return `${verb} le ${new Date(item.occurred_on).toLocaleDateString("fr-FR")}`;
}

export default async function MyItemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: item } = await supabase.from("items").select("*").eq("id", id).single<Item>();
  if (!item) notFound();

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const userId = session?.user?.id ?? null;

  // A restitution can only be confirmed once a meetup has been accepted in
  // the match's chat — fetch the confirmed match for this item (at most one
  // at a time, since a rejected match reverts both items to "searching"),
  // then its latest appointment and who has already confirmed.
  let restitutionPanel: { matchId: string; confirmed: boolean; bothConfirmed: boolean } | null = null;
  if (item.status === "matched" && userId) {
    const { data: match } = await supabase
      .from("matches")
      .select("id")
      .or(`lost_item_id.eq.${id},found_item_id.eq.${id}`)
      .eq("status", "confirmed")
      .maybeSingle<{ id: string }>();

    if (match) {
      const [{ data: appointment }, { data: confirmations }] = await Promise.all([
        supabase
          .from("restitution_appointments")
          .select("id")
          .eq("match_id", match.id)
          .eq("status", "accepted")
          .maybeSingle<{ id: string }>(),
        supabase.from("restitution_confirmations").select("user_id").eq("match_id", match.id).returns<{ user_id: string }[]>(),
      ]);

      if (appointment) {
        const confirmedUserIds = new Set((confirmations ?? []).map((c) => c.user_id));
        restitutionPanel = {
          matchId: match.id,
          confirmed: confirmedUserIds.has(userId),
          bothConfirmed: confirmedUserIds.size >= 2,
        };
      }
    }
  }

  return (
    <div className="bg-background text-on-surface antialiased min-h-screen pb-24 md:pb-12">
      <header className="fixed top-0 inset-x-0 z-50 bg-surface/90 backdrop-blur-md shadow-sm">
        <div
          className="max-w-[720px] mx-auto flex items-center justify-between px-container-margin pb-sm"
          style={{ paddingTop: "calc(0.75rem + env(safe-area-inset-top))" }}
        >
          <Link href="/search" aria-label="Retour" className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:opacity-80 transition-opacity active:scale-95">
            <span className="material-symbols-outlined text-[24px]">arrow_back</span>
          </Link>
          <h1 className="font-display text-headline-sm font-bold text-on-surface text-center flex-1 truncate px-2">{item.title}</h1>
          <div className="w-10 h-10" />
        </div>
      </header>

      <main className="max-w-[720px] mx-auto px-container-margin pt-[calc(88px+env(safe-area-inset-top))]">
        <div className="relative h-56 w-full rounded-2xl overflow-hidden bg-surface-container-high mb-lg flex items-center justify-center text-primary">
          {item.photos?.[0] ? (
            <Image alt={item.title} src={item.photos[0]} fill sizes="(max-width: 768px) 100vw, 720px" className="object-cover" priority />
          ) : (
            <span className="material-symbols-outlined text-6xl">{item.category_icon || "inventory_2"}</span>
          )}
        </div>

        <div className="flex items-center justify-between mb-md">
          <div>
            <p className="font-label-md text-[11px] text-outline uppercase tracking-wider">{item.category_label}</p>
            <p className="font-body-md text-body-md text-on-surface-variant">
              {declaredDateLabel(item)} · {item.location || "Lieu non précisé"}
            </p>
          </div>
        </div>

        {item.description && (
          <section className="bg-surface-container-lowest rounded-2xl soft-shadow p-lg mb-lg">
            <p className="font-body-md text-body-md text-on-surface-variant">{item.description}</p>
          </section>
        )}

        {item.status === "matched" && restitutionPanel ? (
          <RestitutionConfirmPanel
            matchId={restitutionPanel.matchId}
            initiallyConfirmed={restitutionPanel.confirmed}
            initiallyBothConfirmed={restitutionPanel.bothConfirmed}
          />
        ) : item.status === "searching" || item.status === "matched" ? (
          <section className="bg-surface-container-lowest rounded-2xl soft-shadow p-lg flex flex-col items-center text-center gap-2">
            <div className="w-14 h-14 rounded-full bg-error-container text-on-error-container flex items-center justify-center mb-1">
              <span className="material-symbols-outlined">radar</span>
            </div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface">
              {item.status === "matched" ? "Une correspondance a été trouvée" : "Recherche toujours active"}
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-sm">
              {item.status === "matched"
                ? "Consultez l'onglet Activité pour voir la correspondance et échanger."
                : "Personne n'a encore signalé cet objet. Vous serez averti dès qu'une correspondance est trouvée."}
            </p>
          </section>
        ) : (
          <section className="bg-surface-container-lowest rounded-2xl soft-shadow overflow-hidden">
            <div className="p-lg flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#e8f5e9] text-[#2e7d32] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined">check_circle</span>
              </div>
              <div>
                <p className="font-label-md text-[11px] text-outline uppercase tracking-wider">Statut</p>
                <p className="font-headline-sm text-headline-sm text-on-surface">
                  {item.status === "recovered" ? "Objet retrouvé" : "Objet restitué"}
                </p>
              </div>
            </div>
          </section>
        )}
      </main>

      <BottomNav active="search" />
    </div>
  );
}
