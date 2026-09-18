-- Functional bug (match-to-restitution audit): confirm_restitution() reads
-- the match row without locking it, then inserts the caller's confirmation
-- and counts rows in the same statement-level snapshot. Under READ
-- COMMITTED (Postgres's default), if both participants call this within
-- the same window, each transaction inserts its own row, then counts only
-- its own (the other transaction hasn't committed yet), and both return
-- false. Once both commit, restitution_confirmations has 2 rows for the
-- match, but items.status never flips to recovered/returned, the trust
-- bonus never fires, and no notification is sent — the exchange is stuck
-- forever, and RestitutionConfirmPanel disables its button after one click
-- with no way to retry.
--
-- Fix: lock the match row with `for update` before counting, so a second
-- concurrent call blocks until the first commits, then sees the real
-- (post-commit) count instead of racing against it.

create or replace function public.confirm_restitution(p_match_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := auth.uid();
  m public.matches;
  confirmations_count int;
begin
  if me is null then
    raise exception 'Not authenticated';
  end if;

  select * into m from public.matches where id = p_match_id for update;
  if m is null then
    raise exception 'Match not found';
  end if;

  if m.status <> 'confirmed' then
    raise exception 'Match is not confirmed';
  end if;

  if not exists (
    select 1 from public.items where id = m.lost_item_id and user_id = me
  ) and not exists (
    select 1 from public.items where id = m.found_item_id and user_id = me
  ) then
    raise exception 'Not a participant of this match';
  end if;

  if not exists (
    select 1 from public.restitution_appointments
    where match_id = p_match_id and status = 'accepted'
  ) then
    raise exception 'No accepted appointment for this match';
  end if;

  insert into public.restitution_confirmations (match_id, user_id)
  values (p_match_id, me)
  on conflict (match_id, user_id) do nothing;

  select count(*) into confirmations_count
  from public.restitution_confirmations
  where match_id = p_match_id;

  if confirmations_count >= 2 then
    update public.items set status = 'recovered' where id = m.lost_item_id;
    update public.items set status = 'returned' where id = m.found_item_id;

    update public.matches
    set restitution_trust_bonus_awarded = true
    where id = p_match_id and restitution_trust_bonus_awarded = false;

    if found then
      update public.profiles
      set trust_score = least(trust_score + 20, 100)
      where id = (select user_id from public.items where id = m.found_item_id);
    end if;

    return true;
  end if;

  return false;
end;
$$;
