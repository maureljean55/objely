-- Functional bug (match-to-restitution audit): proposeAppointment()
-- (src/lib/supabase/restitution.ts) did two separate client-side inserts —
-- the restitution_appointments row, then the chat message that's the ONLY
-- thing that actually surfaces it (ChatThread only ever renders an
-- appointment via a message with restitution_appointment_id; the
-- appointments list itself isn't rendered independently) — without checking
-- the second insert's error. If it failed (a dropped connection between the
-- two round trips, a transient hiccup), the function still returned success:
-- the appointment row existed in the database but was permanently invisible
-- and unactionable to both participants.
--
-- Fix: do both inserts inside a single function call, so either both
-- succeed or (since one PostgREST RPC call is one transaction) neither
-- does — no plain SQL/PL-pgSQL function needs SECURITY DEFINER for this;
-- it runs as the calling role, so the exact same RLS policies that already
-- governed the two separate inserts still apply.

create or replace function public.propose_appointment(
  p_match_id uuid,
  p_scheduled_date date,
  p_scheduled_time time,
  p_location text
)
returns public.restitution_appointments
language plpgsql
as $$
declare
  me uuid := auth.uid();
  appointment public.restitution_appointments;
begin
  if me is null then
    raise exception 'Not authenticated';
  end if;

  insert into public.restitution_appointments (match_id, proposed_by, scheduled_date, scheduled_time, location)
  values (p_match_id, me, p_scheduled_date, p_scheduled_time, p_location)
  returning * into appointment;

  insert into public.messages (match_id, sender_id, kind, restitution_appointment_id)
  values (p_match_id, me, 'restitution_proposal', appointment.id);

  return appointment;
end;
$$;
