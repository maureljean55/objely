-- Security fix: "Match participants can notify each other" only checked
-- that match_id/user_id were a real participant pairing — type/title/body
-- were entirely client-supplied free text. A match participant could insert
-- a notification that *looks* like a real system event (e.g.
-- type=restitution_confirmed) to manipulate the other participant, since
-- nothing tied the content to anything that actually happened.
--
-- Moves every match-notification write through two security-definer
-- functions that compute title/body server-side from real match/item data
-- for every event type except "message" — where echoing a preview of the
-- message just sent is the whole point, not a spoofing risk (it's exactly
-- what the recipient is about to see in the thread anyway). The old direct-
-- insert policy is dropped so this is the only way in.

drop policy "Match participants can notify each other" on public.notifications;

create or replace function public.notify_match_participant(
  p_match_id uuid,
  p_type text,
  p_message_preview text default null,
  p_accepted boolean default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := auth.uid();
  m public.matches;
  li public.items;
  fi public.items;
  recipient_id uuid;
  v_title text;
  v_body text;
begin
  if me is null then
    raise exception 'Not authenticated';
  end if;

  if p_type not in (
    'message', 'verification_submitted', 'verification_confirmed', 'verification_rejected',
    'restitution_proposed', 'restitution_responded', 'restitution_confirmed'
  ) then
    raise exception 'Invalid notification type';
  end if;

  select * into m from public.matches where id = p_match_id;
  if m is null then
    raise exception 'Match not found';
  end if;

  select * into li from public.items where id = m.lost_item_id;
  select * into fi from public.items where id = m.found_item_id;

  if li.user_id <> me and fi.user_id <> me then
    raise exception 'Not a participant of this match';
  end if;

  recipient_id := case when li.user_id = me then fi.user_id else li.user_id end;

  case p_type
    when 'message' then
      v_title := 'Nouveau message';
      v_body := coalesce(nullif(left(trim(p_message_preview), 120), ''), 'Nouveau message');
    when 'verification_submitted' then
      v_title := 'Réponses de vérification reçues';
      v_body := format('Le déclarant a répondu aux questions pour "%s". Vérifiez ses réponses.', fi.title);
    when 'verification_confirmed' then
      v_title := 'Correspondance confirmée !';
      v_body := format('Votre correspondance pour "%s" est confirmée. Discutez avec le trouveur pour organiser la restitution.', li.title);
    when 'verification_rejected' then
      v_title := 'Correspondance refusée';
      v_body := format('La correspondance pour "%s" a été refusée.', li.title);
    when 'restitution_proposed' then
      v_title := 'Rendez-vous proposé';
      v_body := 'Un rendez-vous de restitution vous a été proposé.';
    when 'restitution_responded' then
      v_title := case when p_accepted then 'Rendez-vous accepté' else 'Rendez-vous refusé' end;
      v_body := case
        when p_accepted then 'Votre rendez-vous de restitution a été accepté.'
        else 'Votre rendez-vous de restitution a été refusé.'
      end;
    when 'restitution_confirmed' then
      v_title := 'Restitution confirmée';
      v_body := 'La restitution de l''objet est confirmée des deux côtés !';
  end case;

  insert into public.notifications (user_id, type, title, body, match_id)
  values (recipient_id, p_type, v_title, v_body, p_match_id);
end;
$$;

revoke all on function public.notify_match_participant(uuid, text, text, boolean) from public;
grant execute on function public.notify_match_participant(uuid, text, text, boolean) to authenticated;

-- Separate from the above because it notifies BOTH sides at once, right
-- when a match is first recorded (matching.ts's createMatch) — before
-- either side has actually opened the match, so there's no single "other
-- participant" yet.
create or replace function public.notify_match_created(p_match_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := auth.uid();
  m public.matches;
  li public.items;
  fi public.items;
  v_body text;
begin
  if me is null then
    raise exception 'Not authenticated';
  end if;

  select * into m from public.matches where id = p_match_id;
  if m is null then
    raise exception 'Match not found';
  end if;

  select * into li from public.items where id = m.lost_item_id;
  select * into fi from public.items where id = m.found_item_id;

  if li.user_id <> me and fi.user_id <> me then
    raise exception 'Not a participant of this match';
  end if;

  v_body := format('"%s" pourrait correspondre à "%s".', li.title, fi.title);

  insert into public.notifications (user_id, type, title, body, match_id)
  values
    (li.user_id, 'match', 'Une correspondance a été trouvée !', v_body, p_match_id),
    (fi.user_id, 'match', 'Une correspondance a été trouvée !', v_body, p_match_id);
end;
$$;

revoke all on function public.notify_match_created(uuid) from public;
grant execute on function public.notify_match_created(uuid) to authenticated;

-- Tightening: "Match participants can submit verification answers" let
-- EITHER participant insert a match_verifications row, not just the
-- lost-item owner (the claimant) who's supposed to be proving ownership.
-- resolve_match() already independently restricts approval to the finder
-- regardless of who submitted a verification row, so this was never a
-- demonstrated bypass — but the RLS should still only grant the claimant
-- the ability to submit their own verification answers.
drop policy "Match participants can submit verification answers" on public.match_verifications;

create policy "The lost-item owner can submit verification answers"
  on public.match_verifications for insert
  to authenticated
  with check (
    auth.uid() = submitted_by
    and exists (
      select 1 from public.matches
      join public.items li on li.id = matches.lost_item_id
      where matches.id = match_verifications.match_id
        and li.user_id = auth.uid()
    )
  );
