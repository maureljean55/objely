import { createClient } from "@/lib/supabase/client";

export type Community = {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  ville_quartier: string | null;
  cover_url: string | null;
  created_at: string;
  updated_at: string;
};

export type CommunityWithCount = Community & { member_count: number };

export type CommunityMember = {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: "owner" | "member";
  joined_at: string;
};

export type CommunityMessage = {
  id: string;
  community_id: string;
  sender_id: string;
  body: string | null;
  kind: "text" | "voice";
  voice_url: string | null;
  edited_at: string | null;
  deleted_at: string | null;
  reply_to_id: string | null;
  created_at: string;
};

export type CommunityLastMessage = {
  community_id: string;
  last_message_body: string | null;
  last_message_kind: "text" | "voice" | null;
  last_message_deleted_at: string | null;
  last_message_sender_name: string | null;
  last_message_created_at: string | null;
};

export type CreateCommunityInput = {
  name: string;
  description?: string;
  villeQuartier?: string;
  coverUrl?: string;
};

/** Full directory, most recent first — visible to anyone, signed in or not. */
export async function listCommunities() {
  const supabase = createClient();
  return supabase
    .from("communities_with_counts")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<CommunityWithCount[]>();
}

/** Communities the current user has joined (any role). Empty if signed out. */
export async function listMyCommunities() {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const userId = session?.user?.id;
  if (!userId) return { data: [] as CommunityWithCount[], error: null };

  const { data: memberships, error: memberError } = await supabase
    .from("community_members")
    .select("community_id")
    .eq("user_id", userId);
  if (memberError || !memberships?.length) return { data: [] as CommunityWithCount[], error: memberError };

  return supabase
    .from("communities_with_counts")
    .select("*")
    .in(
      "id",
      memberships.map((m) => m.community_id),
    )
    .order("created_at", { ascending: false })
    .returns<CommunityWithCount[]>();
}

export async function getCommunity(id: string) {
  const supabase = createClient();
  return supabase.from("communities_with_counts").select("*").eq("id", id).maybeSingle<CommunityWithCount>();
}

/** The current user's membership row for this community, or null if not a member (or signed out). */
export async function getMyMembership(id: string) {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const userId = session?.user?.id;
  if (!userId) return { data: null, error: null };

  return supabase
    .from("community_members")
    .select("role")
    .eq("community_id", id)
    .eq("user_id", userId)
    .maybeSingle<{ role: "owner" | "member" }>();
}

export async function createCommunity(input: CreateCommunityInput) {
  const supabase = createClient();
  return supabase
    .rpc("create_community", {
      p_name: input.name,
      p_description: input.description ?? null,
      p_ville_quartier: input.villeQuartier ?? null,
      p_cover_url: input.coverUrl ?? null,
    })
    .single<string>();
}

export async function joinCommunity(id: string) {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const userId = session?.user?.id;
  if (!userId) return { error: new Error("Vous devez être connecté.") };

  const { error } = await supabase.from("community_members").insert({ community_id: id, user_id: userId, role: "member" });
  return { error };
}

export async function leaveCommunity(id: string) {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const userId = session?.user?.id;
  if (!userId) return { error: new Error("Vous devez être connecté.") };

  const { error } = await supabase.from("community_members").delete().eq("community_id", id).eq("user_id", userId);
  return { error };
}

/** Adds someone straight into the community by their permanent public_id
 * (shown on their own profile as "@<code>") — owner-only (see
 * add_community_member_by_public_id's RLS-equivalent check), and notifies
 * the person added since they never took any action themselves. */
export async function addCommunityMemberByPublicId(id: string, publicId: string) {
  const supabase = createClient();
  const { error } = await supabase.rpc("add_community_member_by_public_id", {
    p_community_id: id,
    p_public_id: publicId,
  });
  if (!error) return { error: null };

  const message = error.message ?? "";
  if (message.includes("Only the owner")) return { error: "Seul le propriétaire peut ajouter des membres." };
  if (message.includes("No user found")) return { error: "Aucun utilisateur ne correspond à cet identifiant." };
  if (message.includes("already a member")) return { error: "Cette personne est déjà membre de la communauté." };
  return { error: "Impossible d'ajouter ce membre, réessayez." };
}

/** Owner-only: removes a member (not the owner, not yourself — see leaveCommunity/deleteCommunity for those). */
export async function removeCommunityMember(id: string, userId: string) {
  const supabase = createClient();
  const { error } = await supabase.rpc("remove_community_member", { p_community_id: id, p_user_id: userId });
  return { error };
}

const COMMUNITY_COVERS_BUCKET = "community-covers";

function storagePathFromPublicUrl(url: string, bucket: string): string | null {
  const marker = `/object/public/${bucket}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return decodeURIComponent(url.slice(idx + marker.length));
}

/** Deletes the community and, best-effort, its cover photo — otherwise the file stays orphaned in storage forever. */
export async function deleteCommunity(id: string, coverUrl?: string | null) {
  const supabase = createClient();
  if (coverUrl) {
    const path = storagePathFromPublicUrl(coverUrl, COMMUNITY_COVERS_BUCKET);
    if (path) await supabase.storage.from(COMMUNITY_COVERS_BUCKET).remove([path]);
  }
  const { error } = await supabase.from("communities").delete().eq("id", id);
  return { error };
}

export async function listCommunityMembers(id: string) {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("list_community_members", { p_community_id: id });
  return { data: (data ?? []) as CommunityMember[], error };
}

// PostgREST caps unbounded selects at config.toml's max_rows (1000) — for a
// community whose history has grown past that, an ascending unlimited query
// would silently return the OLDEST 1000 and drop everything recent instead.
// Fetching the most recent N descending, then reversing, guarantees the
// messages actually shown are always the latest ones.
const RECENT_MESSAGES_LIMIT = 300;

export async function listCommunityMessages(id: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("community_messages")
    .select("*")
    .eq("community_id", id)
    .order("created_at", { ascending: false })
    .limit(RECENT_MESSAGES_LIMIT)
    .returns<CommunityMessage[]>();
  return { data: data ? [...data].reverse() : data, error };
}

export async function sendCommunityMessage(id: string, body: string, replyToId: string | null = null) {
  const supabase = createClient();
  return supabase
    .rpc("send_community_message", { p_community_id: id, p_body: body, p_reply_to_id: replyToId })
    .single<CommunityMessage>();
}

export async function deleteCommunityMessage(messageId: string) {
  const supabase = createClient();
  return supabase.rpc("delete_community_message", { p_message_id: messageId }).single<CommunityMessage>();
}

export async function uploadCommunityCoverPhoto(file: File) {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user ?? null;
  if (!user) return { url: null, error: new Error("Vous devez être connecté.") };

  const ext = file.name.split(".").pop() || "jpg";
  const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error: uploadError } = await supabase.storage.from("community-covers").upload(path, file, {
    contentType: file.type || "image/jpeg",
  });
  if (uploadError) return { url: null, error: uploadError };

  const { data } = supabase.storage.from("community-covers").getPublicUrl(path);
  return { url: data.publicUrl, error: null };
}
