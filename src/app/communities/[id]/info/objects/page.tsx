"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getMyMembership, listCommunitySharedItems, type SharedItemSummary } from "@/lib/supabase/communities";

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  searching: { label: "Recherche active", className: "bg-error-container text-on-error-container" },
  matched: { label: "Correspondance trouvée", className: "bg-primary-fixed text-primary" },
  recovered: { label: "Retrouvé", className: "bg-[#e8f5e9] text-[#2e7d32]" },
  returned: { label: "Restitué", className: "bg-[#e8f5e9] text-[#2e7d32]" },
};

export default function CommunitySharedItemsPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const communityId = params.id;

  const [items, setItems] = useState<SharedItemSummary[] | null>(null);

  useEffect(() => {
    (async () => {
      const { data: myMembership } = await getMyMembership(communityId);
      if (!myMembership) {
        router.replace(`/communities/${communityId}`);
        return;
      }
      const { data } = await listCommunitySharedItems(communityId);
      setItems(data.filter((item) => !item.deleted_at));
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [communityId]);

  return (
    <div className="bg-background text-on-surface antialiased min-h-screen pb-24">
      <header className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-container-margin min-h-14 pt-[env(safe-area-inset-top)] bg-surface/80 backdrop-blur-xl border-b border-outline-variant/30">
        <button
          type="button"
          onClick={() => router.push(`/communities/${communityId}/info`)}
          aria-label="Retour"
          className="w-10 h-10 flex items-center justify-center text-primary hover:opacity-70 transition-opacity active:scale-95"
        >
          <span className="material-symbols-outlined">arrow_back_ios</span>
        </button>
        <h1 className="font-headline-sm text-headline-sm text-on-surface absolute left-1/2 -translate-x-1/2">Objets partagés</h1>
        <div className="w-10 h-10" />
      </header>

      <main className="max-w-[800px] mx-auto pt-[calc(5rem+env(safe-area-inset-top))] pb-8 px-container-margin">
        {items === null ? (
          <div className="flex justify-center py-xl">
            <span className="w-8 h-8 border-4 border-primary-container/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-xl text-center">
            <div className="w-16 h-16 mb-lg rounded-full flex items-center justify-center shadow-lg" style={{ background: "linear-gradient(135deg, #0058bc, #5952af)" }}>
              <span className="material-symbols-outlined text-white text-[30px]">inventory_2</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-2">Aucun objet partagé</h3>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-sm">
              Les objets partagés dans le chat du groupe apparaîtront ici.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {items.map((item) => {
              const status = STATUS_LABEL[item.status] ?? STATUS_LABEL.searching;
              return (
                <Link
                  key={item.id}
                  href={`/search/${item.id}`}
                  className="bg-surface-container-lowest rounded-[20px] shadow-sm overflow-hidden hover:shadow-md transition-all"
                >
                  <div className="relative h-28 w-full bg-surface-container-high text-on-surface-variant flex items-center justify-center">
                    {item.photos?.[0] ? (
                      <Image alt={item.title} src={item.photos[0]} fill sizes="200px" className="object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-3xl">{item.category_icon || "inventory_2"}</span>
                    )}
                    <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full font-label-md text-[10px] font-semibold ${status.className}`}>
                      {status.label}
                    </span>
                  </div>
                  <div className="p-3">
                    <p className="font-body-md text-body-md font-semibold text-on-surface truncate">{item.title}</p>
                    <p className="font-label-md text-[11px] text-on-surface-variant truncate">
                      {item.type === "lost" ? "Objet perdu" : "Objet trouvé"}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
