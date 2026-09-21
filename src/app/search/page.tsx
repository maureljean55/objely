import type { Metadata } from "next";
import BottomNav from "@/components/BottomNav";
import { createClient } from "@/lib/supabase/server";
import type { Item } from "@/lib/supabase/items";
import MyItemsBrowser from "./MyItemsBrowser";

export const metadata: Metadata = {
  title: "Mes objets",
  description: "Recherchez parmi les objets perdus et trouvés signalés sur Objely, près de chez vous.",
};

const NAMED_CATEGORY_IDS = new Set(["phone", "bag", "keys", "wallet", "computer"]);

export default async function SearchFiltersPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; type?: string; status?: string; q?: string }>;
}) {
  const { category = null, type = null, status = null, q = "" } = await searchParams;
  const supabase = await createClient();
  // Middleware already validated/refreshed the session for this request, so
  // reading it back here doesn't need a second round trip to Supabase's
  // Auth server.
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user ?? null;

  const { data: myItems } = user
    ? await supabase
        .from("items")
        .select("*")
        .eq("user_id", user.id)
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .returns<Item[]>()
    : { data: [] as Item[] };

  const hasAnyItems = (myItems ?? []).length > 0;
  const filtersActive = !!(category || type || status);

  // For "matched" items, the card shows the real match percentage and links
  // straight to it — needs each item's most relevant match (highest percent
  // if it somehow has more than one).
  const itemIds = (myItems ?? []).map((i) => i.id);
  const { data: relatedMatches } = itemIds.length
    ? await supabase
        .from("matches")
        .select("id, lost_item_id, found_item_id, match_percent")
        .or(`lost_item_id.in.(${itemIds.join(",")}),found_item_id.in.(${itemIds.join(",")})`)
        .order("match_percent", { ascending: false })
        .returns<{ id: string; lost_item_id: string; found_item_id: string; match_percent: number }[]>()
    : { data: [] as { id: string; lost_item_id: string; found_item_id: string; match_percent: number }[] };

  const matchByItemId: Record<string, { id: string; percent: number }> = {};
  for (const m of relatedMatches ?? []) {
    if (!matchByItemId[m.lost_item_id]) matchByItemId[m.lost_item_id] = { id: m.id, percent: m.match_percent };
    if (!matchByItemId[m.found_item_id]) matchByItemId[m.found_item_id] = { id: m.id, percent: m.match_percent };
  }

  const items = (myItems ?? []).filter((item) => {
    if (category) {
      const matchesCategory = category === "other" ? !NAMED_CATEGORY_IDS.has(item.category_id) : item.category_id === category;
      if (!matchesCategory) return false;
    }
    if (type && item.type !== type) return false;
    if (status) {
      const matchesStatus = status === "resolved" ? item.status === "recovered" || item.status === "returned" : item.status === status;
      if (!matchesStatus) return false;
    }
    return true;
  });

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen pb-24 md:pb-0 pt-[calc(176px+env(safe-area-inset-top))] md:pt-[calc(132px+env(safe-area-inset-top))]">
      <MyItemsBrowser
        items={items}
        matchByItemId={matchByItemId}
        hasAnyItems={hasAnyItems}
        filtersActive={filtersActive}
        category={category}
        type={type}
        status={status}
        initialQuery={q}
      />
      <BottomNav active="search" />
    </div>
  );
}
