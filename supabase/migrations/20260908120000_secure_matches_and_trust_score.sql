-- Security fix: matches could previously be fabricated by any authenticated
-- user (any client-chosen match_percent, either party's own item, instant
-- self-confirmation), which let an attacker view a stranger's profile name
-- and message/notify them by linking a throwaway item to the victim's real
-- item. This closes that hole by:
--   1. Recomputing the match score server-side (mirrors scoreMatch in
--      src/lib/supabase/matching.ts) and rejecting inserts whose
--      match_percent isn't actually earned.
--   2. Only letting the found-item owner move a match to "confirmed", and
--      only once a verification answer has actually been submitted —
--      matching the real app flow (activity/verification page).
--   3. Requiring a match to be "confirmed" before any message can be
--      inserted into it, so the "chat unlocks after verification" rule is
--      enforced by RLS, not just by the chat page's UI.

create extension if not exists unaccent;

create or replace function public.normalize_words(txt text)
returns text[]
language sql
immutable
as $$
  select coalesce(
    array_agg(w) filter (where length(w) > 2),
    '{}'::text[]
  )
  from regexp_split_to_table(unaccent(lower(coalesce(txt, ''))), '[^a-z0-9]+') as w
$$;

-- Same rules as scoreMatch(): same category is the gate, then colors/brand/
-- location/date each add confidence, capped at 100. Used to check that a
-- proposed match wasn't just made up by the client.
create or replace function public.compute_match_score(p_lost_item_id uuid, p_found_item_id uuid)
returns smallint
language sql
stable
as $$
  select case
    when li.category_id is distinct from fi.category_id then 0::smallint
    else least(
      40
      + (case when li.colors is not null and fi.colors is not null and exists (
            select 1 from unnest(li.colors) c1 join unnest(fi.colors) c2
              on lower(trim(c1)) = lower(trim(c2))
          ) then 15 else 0 end)
      + (case when li.brand is not null and fi.brand is not null
              and lower(trim(li.brand)) = lower(trim(fi.brand)) then 15 else 0 end)
      + (case when li.location is not null and fi.location is not null and exists (
            select 1 from unnest(public.normalize_words(li.location)) w1
            join unnest(public.normalize_words(fi.location)) w2 on w1 = w2
          ) then 15 else 0 end)
      + (case when li.occurred_on is not null and fi.occurred_on is not null
              and abs(li.occurred_on - fi.occurred_on) <= 14 then 15 else 0 end)
    , 100)::smallint
  end
  from public.items li, public.items fi
  where li.id = p_lost_item_id and fi.id = p_found_item_id
$$;

drop policy "An involved item owner can create a match" on public.matches;

create policy "An involved owner can record a genuinely scored match"
  on public.matches for insert
  to authenticated
  with check (
    (
      exists (select 1 from public.items where items.id = matches.lost_item_id and items.user_id = auth.uid())
      or exists (select 1 from public.items where items.id = matches.found_item_id and items.user_id = auth.uid())
    )
    and exists (
      select 1 from public.items
      where items.id = matches.lost_item_id and items.type = 'lost' and items.deleted_at is null
    )
    and exists (
      select 1 from public.items
      where items.id = matches.found_item_id and items.type = 'found' and items.deleted_at is null
    )
    and public.compute_match_score(matches.lost_item_id, matches.found_item_id) >= 45
    and matches.match_percent <= public.compute_match_score(matches.lost_item_id, matches.found_item_id)
  );

drop policy "Involved item owners can update a match" on public.matches;

-- Either side can back out of a pending match ("this isn't my item"), but
-- only the found-item owner can confirm one — and only after the lost-item
-- owner has actually submitted verification answers for it to review.
create policy "Match participants can resolve a pending match"
  on public.matches for update
  to authenticated
  using (
    status = 'pending'
    and (
      exists (select 1 from public.items where items.id = matches.lost_item_id and items.user_id = auth.uid())
      or exists (select 1 from public.items where items.id = matches.found_item_id and items.user_id = auth.uid())
    )
  )
  with check (
    status = 'rejected'
    or (
      status = 'confirmed'
      and exists (select 1 from public.items where items.id = matches.found_item_id and items.user_id = auth.uid())
      and exists (select 1 from public.match_verifications where match_verifications.match_id = matches.id)
    )
  );

drop policy "Match participants can send messages" on public.messages;

create policy "Confirmed match participants can send messages"
  on public.messages for insert
  to authenticated
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.matches
      join public.items li on li.id = matches.lost_item_id
      join public.items fi on fi.id = matches.found_item_id
      where matches.id = messages.match_id
        and matches.status = 'confirmed'
        and (li.user_id = auth.uid() or fi.user_id = auth.uid())
    )
  );

-- A user could otherwise insert a message into their own support
-- conversation tagged sender = 'admin' and see a fake agent reply in their
-- own history. The bot's own replies still go through this same
-- user-session policy (see /api/support-chat), so 'bot' stays allowed.
drop policy "Users can send messages in their own support conversations" on public.support_messages;

create policy "Users can send user/bot messages in their own support conversations"
  on public.support_messages for insert
  to authenticated
  with check (
    sender in ('user', 'bot')
    and exists (
      select 1 from public.support_conversations
      where support_conversations.id = support_messages.conversation_id
        and support_conversations.user_id = auth.uid()
    )
  );

-- Security fix: increment_trust_score(delta) was callable directly by any
-- authenticated client via RPC with an arbitrary delta, letting a user
-- self-boost their trust score to 100 with no real event behind it. Replace
-- it with two narrow functions, each tied to a real, checkable event, and a
-- flag column so the bonus can't be claimed twice for the same item/match.

alter table public.items
  add column found_trust_bonus_awarded boolean not null default false;

alter table public.matches
  add column restitution_trust_bonus_awarded boolean not null default false;

drop function if exists public.increment_trust_score(smallint);

create function public.award_found_item_trust_bonus(p_item_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.items
  set found_trust_bonus_awarded = true
  where id = p_item_id
    and user_id = auth.uid()
    and type = 'found'
    and found_trust_bonus_awarded = false;

  if found then
    update public.profiles set trust_score = least(trust_score + 5, 100) where id = auth.uid();
  end if;
end;
$$;

create function public.award_restitution_trust_bonus(p_match_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.matches
  set restitution_trust_bonus_awarded = true
  where id = p_match_id
    and status = 'confirmed'
    and restitution_trust_bonus_awarded = false
    and exists (
      select 1 from public.items
      where items.id = matches.found_item_id and items.user_id = auth.uid()
    );

  if found then
    update public.profiles set trust_score = least(trust_score + 20, 100) where id = auth.uid();
  end if;
end;
$$;
