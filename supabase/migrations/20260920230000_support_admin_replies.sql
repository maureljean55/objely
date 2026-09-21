-- Lets an admin actually reply to an escalated support conversation from
-- the admin portal (there was no such interface yet — see the comment at
-- the top of 20260907202850_support_chat.sql anticipating this). Records
-- which admin answered by name (same plain-text-attribution pattern as
-- problem_reports.resolved_by, not a foreign key) so the user-facing chat
-- can show a real name instead of the generic "Conseiller Objely", and so
-- the "a human has been notified" banner can hide once someone's actually
-- answered.
alter table public.support_messages
  add column sender_name text;

-- The user's chat page only ever fetched history once on load — an admin
-- reply (or the bot handing off) never showed up until a manual refresh.
-- Realtime lets it appear live, the same way messages/direct_messages/
-- community_messages already do.
alter publication supabase_realtime add table public.support_messages;
alter publication supabase_realtime add table public.support_conversations;
