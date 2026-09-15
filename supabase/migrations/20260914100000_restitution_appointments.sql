-- Restitution appointments: once a match is confirmed (ownership verified,
-- chat unlocked), either participant can propose a meetup — date, time,
-- location — to hand the item back. The OTHER participant accepts or
-- declines it from the same chat thread. A declined proposal doesn't block
-- future ones; either side can just propose again.
--
-- This also changes what "confirmed" means for items: previously
-- resolve_match's approve path flipped items straight to recovered/returned
-- the moment identity was verified — before any actual handoff. That was
-- also silently broken by RLS (the found-item owner calling it can't update
-- the lost item they don't own; only the found item's own update ever took
-- effect). Both problems are fixed together here: resolving a match now only
-- moves matches.status and (on reject) reverts both items to "searching";
-- items only reach recovered/returned once both sides confirm restitution
-- actually happened, via confirm_restitution() below.

create type public.appointment_status as enum ('pending', 'accepted', 'declined');

create table public.restitution_appointments (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches (id) on delete cascade,
  proposed_by uuid not null references auth.users (id) on delete cascade,
  scheduled_date date not null,
  scheduled_time time not null,
  location text not null,
  status public.appointment_status not null default 'pending',
  responded_at timestamptz,
  created_at timestamptz not null default now()
);

create index restitution_appointments_match_id_idx on public.restitution_appointments (match_id, created_at desc);

alter table public.restitution_appointments enable row level security;

create policy "Match participants can view restitution appointments"
  on public.restitution_appointments for select
  to authenticated
  using (
    exists (
      select 1 from public.matches
      join public.items li on li.id = matches.lost_item_id
      join public.items fi on fi.id = matches.found_item_id
      where matches.id = restitution_appointments.match_id
        and (li.user_id = auth.uid() or fi.user_id = auth.uid())
    )
  );

create policy "Match participants can propose a restitution appointment"
  on public.restitution_appointments for insert
  to authenticated
  with check (
    auth.uid() = proposed_by
    and exists (
      select 1 from public.matches
      join public.items li on li.id = matches.lost_item_id
      join public.items fi on fi.id = matches.found_item_id
      where matches.id = restitution_appointments.match_id
        and matches.status = 'confirmed'
        and (li.user_id = auth.uid() or fi.user_id = auth.uid())
    )
  );

-- Only the OTHER participant (not the proposer) can respond, and only while
-- still pending — once accepted/declined it's final history, propose a new
-- row for a new attempt.
create policy "The other participant can respond to a pending appointment"
  on public.restitution_appointments for update
  to authenticated
  using (
    status = 'pending'
    and auth.uid() <> proposed_by
    and exists (
      select 1 from public.matches
      join public.items li on li.id = matches.lost_item_id
      join public.items fi on fi.id = matches.found_item_id
      where matches.id = restitution_appointments.match_id
        and (li.user_id = auth.uid() or fi.user_id = auth.uid())
    )
  )
  with check (status in ('accepted', 'declined'));

-- One confirmation row per participant per match. No client insert policy —
-- rows are only ever written by confirm_restitution() below, which is also
-- the only thing allowed to flip items to recovered/returned (a client-side
-- update can't do that itself: it would need to update the other party's
-- item, which "Users can update their own items" never allows).
create table public.restitution_confirmations (
  match_id uuid not null references public.matches (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  confirmed_at timestamptz not null default now(),
  primary key (match_id, user_id)
);

alter table public.restitution_confirmations enable row level security;

create policy "Match participants can view restitution confirmations"
  on public.restitution_confirmations for select
  to authenticated
  using (
    exists (
      select 1 from public.matches
      join public.items li on li.id = matches.lost_item_id
      join public.items fi on fi.id = matches.found_item_id
      where matches.id = restitution_confirmations.match_id
        and (li.user_id = auth.uid() or fi.user_id = auth.uid())
    )
  );

-- Replaces the old client-side direct .update() calls in resolveMatch(),
-- which silently failed to update the item the caller doesn't own. Approve
-- now only unlocks chat (matches.status -> confirmed); items stay "matched"
-- until confirm_restitution() finalizes both sides. Reject reverts both
-- items to "searching" so they resume matching.
create or replace function public.resolve_match(p_match_id uuid, p_approved boolean)
returns public.matches
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := auth.uid();
  m public.matches;
  updated public.matches;
begin
  if me is null then
    raise exception 'Not authenticated';
  end if;

  select * into m from public.matches where id = p_match_id;
  if m is null then
    raise exception 'Match not found';
  end if;

  if m.status <> 'pending' then
    raise exception 'Match is not pending';
  end if;

  if not exists (select 1 from public.items where id = m.found_item_id and user_id = me) then
    raise exception 'Only the finder can resolve this match';
  end if;

  if p_approved and not public.match_has_verification(p_match_id) then
    raise exception 'No verification submitted yet';
  end if;

  update public.matches
  set status = case when p_approved then 'confirmed' else 'rejected' end
  where id = p_match_id
  returning * into updated;

  if not p_approved then
    update public.items set status = 'searching' where id in (m.lost_item_id, m.found_item_id);
  end if;

  return updated;
end;
$$;

revoke all on function public.resolve_match(uuid, boolean) from public;
grant execute on function public.resolve_match(uuid, boolean) to authenticated;

-- Records that the calling participant confirms the physical restitution
-- happened. Once both participants have confirmed, finalizes it: lost item
-- -> recovered, found item -> returned, and awards the finder's trust bonus
-- (moved here from the old verification-approve moment, since restitution
-- itself is the real event worth rewarding).
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

  select * into m from public.matches where id = p_match_id;
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

revoke all on function public.confirm_restitution(uuid) from public;
grant execute on function public.confirm_restitution(uuid) to authenticated;

-- A restitution proposal shows up as a special message bubble in the chat
-- (same table both participants already subscribe to via realtime), linked
-- to the appointment row it represents.
alter table public.messages
  add column restitution_appointment_id uuid references public.restitution_appointments (id) on delete set null;

alter table public.messages
  drop constraint messages_content_matches_kind;

alter table public.messages
  drop constraint messages_kind_check;

alter table public.messages
  add constraint messages_kind_check check (kind in ('text', 'voice', 'restitution_proposal')),
  add constraint messages_content_matches_kind check (
    (kind = 'text' and body is not null and voice_url is null)
    or (kind = 'voice' and voice_url is not null)
    or (kind = 'restitution_proposal' and restitution_appointment_id is not null)
  );
