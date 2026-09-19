"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import GuardedActionLink from "@/components/home/GuardedActionLink";
import type { CommunityWithCount } from "@/lib/supabase/communities";

function CommunityCover({ community, size = 48 }: { community: CommunityWithCount; size?: number }) {
  return (
    <div
      className="relative shrink-0 rounded-2xl overflow-hidden bg-surface-container-highest text-on-surface-variant flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {community.cover_url ? (
        <Image alt={community.name} src={community.cover_url} fill sizes={`${size}px`} className="object-cover" />
      ) : (
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
          groups
        </span>
      )}
    </div>
  );
}

function CommunityRow({ community }: { community: CommunityWithCount }) {
  return (
    <Link
      href={`/communities/${community.id}`}
      className="flex items-center gap-4 px-md py-4 hover:bg-surface-container-low transition-colors"
    >
      <CommunityCover community={community} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <span className="font-label-md text-label-md text-on-surface font-semibold truncate pr-2">{community.name}</span>
          <span className="font-label-md text-[11px] text-outline shrink-0">
            {community.member_count} {community.member_count > 1 ? "membres" : "membre"}
          </span>
        </div>
        <p className="font-body-md text-body-md text-on-surface-variant truncate">
          {community.ville_quartier || community.description || "Communauté de déclarants"}
        </p>
      </div>
      <span className="material-symbols-outlined text-outline-variant shrink-0">chevron_right</span>
    </Link>
  );
}

export default function CommunitiesBrowser({
  allCommunities,
  myCommunities,
  authenticated,
}: {
  allCommunities: CommunityWithCount[];
  myCommunities: CommunityWithCount[];
  authenticated: boolean;
}) {
  const [query, setQuery] = useState("");

  const myIds = useMemo(() => new Set(myCommunities.map((c) => c.id)), [myCommunities]);
  const directory = useMemo(() => allCommunities.filter((c) => !myIds.has(c.id)), [allCommunities, myIds]);

  const visibleDirectory = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return directory;
    return directory.filter((c) => [c.name, c.ville_quartier, c.description].some((field) => field?.toLowerCase().includes(q)));
  }, [directory, query]);

  return (
    <div className="flex flex-col gap-lg">
      <GuardedActionLink
        href="/communities/new"
        authenticated={authenticated}
        message="Connectez-vous pour créer une communauté de déclarants."
        emoji="🤝"
        className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-white font-headline-sm text-headline-sm shadow-[0px_10px_30px_rgba(0,88,188,0.25)] hover:opacity-90 transition-opacity"
        style={{ background: "linear-gradient(135deg, #3276e8, #916af4)" }}
      >
        <span className="material-symbols-outlined">add_circle</span>
        Créer une communauté
      </GuardedActionLink>

      {authenticated && myCommunities.length > 0 && (
        <section>
          <h3 className="font-label-md text-label-md text-outline uppercase tracking-wider mb-2 ml-1">Mes communautés</h3>
          <div className="bg-surface-container-lowest rounded-[20px] soft-shadow divide-y divide-outline-variant/30 overflow-hidden">
            {myCommunities.map((community) => (
              <CommunityRow key={community.id} community={community} />
            ))}
          </div>
        </section>
      )}

      <section>
        <h3 className="font-label-md text-label-md text-outline uppercase tracking-wider mb-2 ml-1">Découvrir</h3>

        <div className="relative mb-3">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">search</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher une communauté, une ville..."
            className="w-full bg-surface-container-lowest text-on-surface placeholder:text-outline rounded-full border-none focus:outline-none focus:ring-2 focus:ring-primary/30 pl-[48px] pr-4 h-[52px] font-body-md shadow-sm"
          />
        </div>

        {visibleDirectory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-xl text-center">
            <div
              className="w-16 h-16 mb-lg rounded-full flex items-center justify-center shadow-lg"
              style={{ background: "linear-gradient(135deg, #0058bc, #5952af)" }}
            >
              <span className="material-symbols-outlined text-white text-[30px]">groups</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-2">
              {allCommunities.length === 0 ? "Aucune communauté pour l'instant" : "Aucun résultat"}
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-sm">
              {allCommunities.length === 0
                ? "Soyez le premier à en créer une pour votre quartier ou votre ville !"
                : "Essayez un autre nom de ville ou de communauté."}
            </p>
          </div>
        ) : (
          <div className="bg-surface-container-lowest rounded-[20px] soft-shadow divide-y divide-outline-variant/30 overflow-hidden">
            {visibleDirectory.map((community) => (
              <CommunityRow key={community.id} community={community} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
