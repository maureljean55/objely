-- The chat pages only ever fetched messages once on load and appended the
-- sender's own new message locally — the other participant never saw a new
-- message (text or voice) arrive until they manually reloaded the page.
-- Add both message tables to the realtime publication so the client can
-- subscribe to new/edited/deleted messages and update the thread live.
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.direct_messages;
