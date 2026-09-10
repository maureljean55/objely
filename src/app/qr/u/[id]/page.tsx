import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { PublicProfile } from "@/lib/supabase/profile";

function trustLabel(score: number) {
  if (score >= 70) return "Membre Or";
  if (score >= 40) return "Membre Argent";
  if (score >= 15) return "Membre Bronze";
  return "Utilisateur Objely";
}

export default async function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user: viewer },
  } = await supabase.auth.getUser();
  if (!viewer) redirect(`/login?next=/qr/u/${id}`);

  const { data: profile } = await supabase.rpc("get_public_profile", { profile_id: id }).maybeSingle<PublicProfile>();
  if (!profile) notFound();

  const isSelf = viewer.id === profile.id;

  return (
    <div className="bg-background text-on-background font-body-md antialiased min-h-screen flex flex-col">
      <header className="glass-header fixed top-0 inset-x-0 z-50 flex items-center px-container-margin min-h-14 pt-[env(safe-area-inset-top)] w-full shadow-[0_1px_0_rgba(0,0,0,0.05)]">
        <Link href="/qr" aria-label="Retour" className="w-10 h-10 flex items-center justify-center rounded-full text-primary hover:bg-surface-container-high/50 transition-colors -ml-2">
          <span className="material-symbols-outlined">arrow_back_ios</span>
        </Link>
        <h1 className="font-headline-sm text-headline-sm text-on-surface flex-1 text-center truncate px-2">Profil Objely</h1>
        <div className="w-10 h-10" />
      </header>

      <main className="flex-1 w-full max-w-md mx-auto pt-[calc(104px+env(safe-area-inset-top))] px-container-margin flex flex-col items-center pb-xl">
        <div className="flex flex-col items-center mt-lg mb-xl">
          <div className="relative mb-lg w-32 h-32 rounded-full overflow-hidden border-4 border-surface shadow-sm bg-surface-container-high flex items-center justify-center text-on-surface-variant">
            {profile.avatar_url ? (
              <Image alt={profile.full_name ?? "Profil"} src={profile.avatar_url} fill sizes="128px" className="object-cover" />
            ) : (
              <span className="material-symbols-outlined text-[56px]">person</span>
            )}
          </div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface text-center mb-2">{profile.full_name || "Utilisateur Objely"}</h2>
          <div className="inline-flex items-center gap-1.5 bg-surface-container-high px-3 py-1 rounded-full">
            <span className="material-symbols-outlined text-[16px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            <span className="font-body-md text-body-md text-[13px] text-on-surface-variant">{trustLabel(profile.trust_score)}</span>
          </div>
        </div>

        {isSelf ? (
          <p className="font-body-md text-body-md text-on-surface-variant text-center">C&apos;est votre propre QR Code.</p>
        ) : profile.phone ? (
          <div className="w-full bg-surface-container-lowest rounded-2xl p-lg mb-xl soft-shadow flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-primary-container/10 text-primary-container flex items-center justify-center mb-md">
              <span className="material-symbols-outlined text-2xl">lock_open</span>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant mb-lg max-w-xs">
              Cette personne a choisi de partager son numéro avec vous.
            </p>
            <div className="bg-surface-container-low px-lg py-md rounded-xl w-full border border-outline-variant/30 flex items-center justify-center gap-3">
              <span className="material-symbols-outlined text-on-surface-variant">phone_iphone</span>
              <span className="font-headline-lg text-headline-lg text-on-surface tracking-widest">{profile.phone}</span>
            </div>
          </div>
        ) : (
          <div className="w-full bg-surface-container-lowest rounded-xl soft-shadow p-md flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-surface-variant flex items-center justify-center text-on-surface-variant shrink-0">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Numéro privé</h3>
              <p className="font-body-md text-body-md text-[13px] text-on-surface-variant mt-0.5">
                Cette personne n&apos;a pas autorisé l&apos;affichage de son numéro.
              </p>
            </div>
          </div>
        )}

        {!isSelf && profile.phone && (
          <a
            href={`tel:${profile.phone}`}
            className="w-full h-[50px] bg-primary text-on-primary font-headline-sm text-headline-sm rounded-xl shadow-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform mt-auto"
          >
            <span className="material-symbols-outlined">call</span>
            Appeler
          </a>
        )}
      </main>
    </div>
  );
}
