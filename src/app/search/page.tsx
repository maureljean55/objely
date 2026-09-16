import BottomNav from "@/components/BottomNav";
import { createClient } from "@/lib/supabase/server";
import type { Item } from "@/lib/supabase/items";
import MyItemsBrowser from "./MyItemsBrowser";

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
      <MyItemsBrowser items={items} hasAnyItems={hasAnyItems} filtersActive={filtersActive} category={category} type={type} status={status} initialQuery={q} />
      <BottomNav active="search" />
    </div>
  );
}
