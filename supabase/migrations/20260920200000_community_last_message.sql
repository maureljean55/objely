-- The redesigned communities directory (src/app/communities/CommunitiesBrowser.tsx)
-- shows a WhatsApp-style preview (last sender + message + time) under each
-- of "my communities", same idea as list_my_direct_conversations for DMs.
-- community_messages' own RLS ("members only") already covers who's
-- allowed to see this; this just does the per-community latest-message
-- lookup as one round trip instead of N.
create or replace function public.list_my_communities_with_last_message()
returns table (
  community_id uuid,
  last_message_body text,
  last_message_kind text,
  last_message_deleted_at timestamptz,
  last_message_sender_name text,
  last_message_created_at timestamptz
)
language sql
security definer
set search_path = public
stable
as $$
  select
    cm.community_id,
    lm.body,
    lm.kind,
    lm.deleted_at,
    sender.full_name,
    lm.created_at
  from public.community_members cm
  left join lateral (
    select body, kind, deleted_at, sender_id, created_at
    from public.community_messages
    where community_id = cm.community_id
    order by created_at desc
    limit 1
  ) lm on true
  left join public.profiles sender on sender.id = lm.sender_id
  where cm.user_id = auth.uid();
$$;

revoke all on function public.list_my_communities_with_last_message() from public;
grant execute on function public.list_my_communities_with_last_message() to authenticated;
