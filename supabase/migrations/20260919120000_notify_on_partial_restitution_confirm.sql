-- Functional bug (match-to-restitution audit): confirmRestitution() only
-- notified the other participant once BOTH sides had confirmed
-- (restitution_confirmed). When the first participant confirms, the other
-- gets nothing — no notification, no cue in chat (the accepted appointment
-- card just shows a static "Accepté" badge) — breaking the pattern every
-- other transition in this flow follows (match created, verification
-- submitted, verification confirmed/rejected, appointment proposed/
-- responded all notify the other side). This reproduces the same
-- "silently stuck, no discoverable next step" symptom as the verification
-- bug, just one step later.

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
    'restitution_proposed', 'restitution_responded', 'restitution_confirmed',
    'restitution_pending_confirmation'
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
    when 'restitution_pending_confirmation' then
      v_title := 'À votre tour de confirmer';
      v_body := 'L''autre personne a confirmé la restitution. Confirmez à votre tour pour finaliser l''échange.';
  end case;

  insert into public.notifications (user_id, type, title, body, match_id)
  values (recipient_id, p_type, v_title, v_body, p_match_id);
end;
$$;
