import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

/** Backs the /debug/realtime diagnostic page's "Ping depuis le serveur" button. */
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const targetUserId = body?.targetUserId;
  if (typeof targetUserId !== "string") return NextResponse.json({ error: "targetUserId manquant." }, { status: 400 });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return NextResponse.json({ error: "Config manquante." }, { status: 500 });

  const client = createSupabaseClient(url, key, { auth: { persistSession: false } });
  const channel = client.channel(`calls:user:${targetUserId}`);

  try {
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("timeout")), 4000);
      channel.subscribe((status) => {
        if (status === "SUBSCRIBED") {
          clearTimeout(timer);
          resolve();
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
          clearTimeout(timer);
          reject(new Error(status));
        }
      });
    });
    const result = await channel.send({
      type: "broadcast",
      event: "ping",
      payload: { fromId: user.id, sentAt: new Date().toLocaleTimeString("fr-FR") },
    });
    return NextResponse.json({ sent: true, result });
  } catch (err) {
    return NextResponse.json({ sent: false, error: err instanceof Error ? err.message : String(err) });
  } finally {
    await client.removeChannel(channel);
  }
}
