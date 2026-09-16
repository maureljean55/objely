import { createClient } from "@/lib/supabase/client";
import { notifyMatchParticipant } from "@/lib/supabase/notifications";

export type AppointmentStatus = "pending" | "accepted" | "declined";

export type RestitutionAppointment = {
  id: string;
  match_id: string;
  proposed_by: string;
  scheduled_date: string;
  scheduled_time: string;
  location: string;
  status: AppointmentStatus;
  responded_at: string | null;
  created_at: string;
};

/** Proposes a handoff meetup and posts it as a special message bubble in the match's chat. */
export async function proposeAppointment(matchId: string, date: string, time: string, location: string) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user ?? null;
  if (!user) return { data: null, error: new Error("Vous devez être connecté.") };

  const { data: appointment, error } = await supabase
    .from("restitution_appointments")
    .insert({ match_id: matchId, proposed_by: user.id, scheduled_date: date, scheduled_time: time, location })
    .select()
    .single<RestitutionAppointment>();

  if (error || !appointment) return { data: null, error };

  await supabase
    .from("messages")
    .insert({ match_id: matchId, sender_id: user.id, kind: "restitution_proposal", restitution_appointment_id: appointment.id });

  await notifyMatchParticipant(matchId, "restitution_proposed");

  return { data: appointment, error: null };
}

/** The receiving participant accepts or declines a pending appointment. */
export async function respondToAppointment(appointmentId: string, matchId: string, accept: boolean) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user ?? null;
  if (!user) return { data: null, error: new Error("Vous devez être connecté.") };

  const result = await supabase
    .from("restitution_appointments")
    .update({ status: accept ? "accepted" : "declined", responded_at: new Date().toISOString() })
    .eq("id", appointmentId)
    .select()
    .single<RestitutionAppointment>();

  if (!result.error) await notifyMatchParticipant(matchId, "restitution_responded", { accepted: accept });

  return result;
}

/** Most recent appointment proposed for a match, whatever its status. */
export async function getLatestAppointment(matchId: string) {
  const supabase = createClient();
  return supabase
    .from("restitution_appointments")
    .select("*")
    .eq("match_id", matchId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<RestitutionAppointment>();
}

/** Who (of the match's two participants) has already confirmed the physical restitution. */
export async function getRestitutionConfirmations(matchId: string) {
  const supabase = createClient();
  return supabase.from("restitution_confirmations").select("user_id").eq("match_id", matchId).returns<{ user_id: string }[]>();
}

/**
 * Records the caller's confirmation that restitution happened. Returns
 * `bothConfirmed: true` once both participants have confirmed — at that
 * point the server has already flipped both items to recovered/returned.
 */
export async function confirmRestitution(matchId: string) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user ?? null;
  if (!user) return { bothConfirmed: false, error: new Error("Vous devez être connecté.") };

  const { data, error } = await supabase.rpc("confirm_restitution", { p_match_id: matchId });
  if (error) return { bothConfirmed: false, error };

  if (data === true) await notifyMatchParticipant(matchId, "restitution_confirmed");

  return { bothConfirmed: data === true, error: null };
}
