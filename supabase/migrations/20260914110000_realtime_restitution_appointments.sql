-- The chat's "+" rendez-vous proposal needs the OTHER participant to see an
-- accept/decline update live, same as messages already do — without this,
-- postgres_changes never fires for restitution_appointments and the
-- proposer's own screen is the only one that would ever reflect a response
-- (and only after a reload, at that).
alter publication supabase_realtime add table public.restitution_appointments;
