-- Found via penetration-test-style review: /api/support-chat had no rate
-- limit at all, and every user message triggers a real, billed Gemini API
-- call. A scripted loop from one authenticated account could run up the
-- API bill or degrade the service for everyone — cost-abuse/DoS, not a
-- data-access issue, but a real one. Mirrors the existing
-- user_items_created_in_last_24h pattern (cap_daily_declarations.sql):
-- a stable counting function the route checks before doing anything
-- billable, generous enough (20/min) not to get in the way of a real
-- back-and-forth conversation.
create function public.user_support_messages_in_last_minute(p_user_id uuid)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::int
  from public.support_messages sm
  join public.support_conversations sc on sc.id = sm.conversation_id
  where sc.user_id = p_user_id
    and sm.sender = 'user'
    and sm.created_at > now() - interval '1 minute'
$$;

revoke all on function public.user_support_messages_in_last_minute(uuid) from public, anon;
grant execute on function public.user_support_messages_in_last_minute(uuid) to authenticated;
