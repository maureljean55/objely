import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ESCALATE_MARKER = "[ESCALATE]";
const GEMINI_MODEL = "gemini-3.6-flash";
const INACTIVITY_ARCHIVE_MS = 10 * 60 * 1000;

function greeting() {
  const hour = new Date().getHours();
  return hour >= 18 || hour < 5 ? "Bonsoir" : "Bonjour";
}

async function buildSystemPrompt(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: faqItems } = await supabase.from("faq_items").select("question, answer").order("sort_order");
  const faqText = (faqItems ?? []).map((f) => `Q: ${f.question}\nR: ${f.answer}`).join("\n\n");

  return `Tu es l'assistant du service client d'Objely, une application française d'objets perdus/trouvés (déclarer un objet perdu ou trouvé, correspondance automatique, vérification de propriété, restitution en lieu public, messagerie entre utilisateurs).

Réponds toujours en français, de façon brève, chaleureuse et concrète. Voici la foire aux questions officielle de l'app, utilise-la comme source de vérité :

${faqText}

Si la question sort de ton champ de compétence, si l'utilisateur est mécontent, insiste pour parler à un humain, ou si tu ne peux vraiment pas résoudre son problème (ex: litige, remboursement, compte compromis, bug technique précis), termine ta réponse par le marqueur exact ${ESCALATE_MARKER} sur une ligne à part — un conseiller humain prendra le relais. N'utilise ce marqueur que quand c'est vraiment nécessaire, pas pour de simples questions couvertes par la FAQ.`;
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Le service d'assistance n'est pas configuré." }, { status: 503 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Vous devez être connecté." }, { status: 401 });
  }

  const { conversationId, message } = (await request.json()) as { conversationId: string; message: string };
  if (!conversationId || !message?.trim()) {
    return NextResponse.json({ error: "Message invalide." }, { status: 400 });
  }

  const { data: conversation } = await supabase
    .from("support_conversations")
    .select("id, status")
    .eq("id", conversationId)
    .single<{ id: string; status: "bot" | "escalated" | "closed" }>();
  if (!conversation) {
    return NextResponse.json({ error: "Conversation introuvable." }, { status: 404 });
  }

  const { data: userMessage, error: insertError } = await supabase
    .from("support_messages")
    .insert({ conversation_id: conversationId, sender: "user", body: message.trim() })
    .select()
    .single();
  if (insertError) {
    return NextResponse.json({ error: "Une erreur est survenue." }, { status: 500 });
  }

  // Once escalated, the bot stops replying — a human takes it from here.
  if (conversation.status !== "bot") {
    return NextResponse.json({ userMessage, botMessage: null, escalated: true });
  }

  const { data: history } = await supabase
    .from("support_messages")
    .select("sender, body")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(30);

  const systemPrompt = await buildSystemPrompt(supabase);
  const contents = (history ?? []).map((m) => ({
    role: m.sender === "user" ? "user" : "model",
    parts: [{ text: m.body }],
  }));

  let botText = "Merci pour votre message, un conseiller va prendre le relais dès que possible.";
  let escalated = false;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents,
          // This model always reasons internally before answering, and that
          // "thinking" counts against maxOutputTokens — a low budget here
          // silently truncates the actual visible reply.
          generationConfig: { temperature: 0.4, maxOutputTokens: 1024 },
        }),
      },
    );
    const json = await response.json();
    const raw: string | undefined = json?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (raw) {
      escalated = raw.includes(ESCALATE_MARKER);
      botText = raw.replace(ESCALATE_MARKER, "").trim();
      if (escalated) {
        botText += "\n\nJe transmets votre demande à un conseiller humain, qui vous répondra ici dès que possible.";
      }
    }
  } catch {
    escalated = true;
    botText = "Désolé, une erreur technique est survenue. Je transmets votre demande à un conseiller humain.";
  }

  const { data: botMessage } = await supabase
    .from("support_messages")
    .insert({ conversation_id: conversationId, sender: "bot", body: botText })
    .select()
    .single();

  if (escalated) {
    await supabase.from("support_conversations").update({ status: "escalated" }).eq("id", conversationId);
  }

  return NextResponse.json({ userMessage, botMessage, escalated });
}

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Vous devez être connecté." }, { status: 401 });
  }

  const requestedId = new URL(request.url).searchParams.get("conversation");
  let conversationId: string | undefined;

  if (requestedId) {
    // Resuming a specific conversation from Historique — must belong to the
    // caller (RLS enforces this too) and, if it had been auto-archived for
    // inactivity, reopen it so the bot replies again.
    const { data: requested } = await supabase
      .from("support_conversations")
      .select("id, status")
      .eq("id", requestedId)
      .eq("user_id", user.id)
      .maybeSingle<{ id: string; status: "bot" | "escalated" | "closed" }>();
    if (requested) {
      conversationId = requested.id;
      if (requested.status === "closed") {
        await supabase.from("support_conversations").update({ status: "bot" }).eq("id", requested.id);
      }
    }
  }

  if (!conversationId) {
    // Reuse the latest conversation only while it's still "fresh": escalated
    // ones stay open indefinitely (a human hasn't answered yet), bot ones
    // get archived to Historique after 10 minutes of inactivity.
    const { data: latest } = await supabase
      .from("support_conversations")
      .select("id, status")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle<{ id: string; status: "bot" | "escalated" | "closed" }>();

    if (latest?.status === "escalated") {
      conversationId = latest.id;
    } else if (latest?.status === "bot") {
      const { data: lastMessage } = await supabase
        .from("support_messages")
        .select("created_at")
        .eq("conversation_id", latest.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle<{ created_at: string }>();
      const lastActivity = lastMessage ? new Date(lastMessage.created_at).getTime() : 0;
      if (Date.now() - lastActivity < INACTIVITY_ARCHIVE_MS) {
        conversationId = latest.id;
      } else {
        await supabase.from("support_conversations").update({ status: "closed" }).eq("id", latest.id);
      }
    }
  }

  if (!conversationId) {
    const { data: created, error } = await supabase
      .from("support_conversations")
      .insert({ user_id: user.id })
      .select("id")
      .single<{ id: string }>();
    if (error || !created) {
      return NextResponse.json({ error: "Une erreur est survenue." }, { status: 500 });
    }
    conversationId = created.id;
    await supabase.from("support_messages").insert({
      conversation_id: conversationId,
      sender: "bot",
      body: `${greeting()} 👋 Comment pouvons-nous vous aider aujourd'hui ?`,
    });
  }

  const { data: messages } = await supabase
    .from("support_messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  const { data: conversation } = await supabase
    .from("support_conversations")
    .select("id, status")
    .eq("id", conversationId)
    .single();

  return NextResponse.json({ conversation, messages: messages ?? [] });
}
