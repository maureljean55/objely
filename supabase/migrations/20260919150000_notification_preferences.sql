-- The notification settings page (src/app/profile/notifications/page.tsx)
-- was pure decoration: every switch was local React state that never
-- persisted anywhere and never actually gated anything — the app's real
-- notifications (match/message/verification/restitution/chat_closed) fired
-- unconditionally regardless of what any switch showed. Give the essential
-- categories real, persisted preferences that the server actually respects
-- before inserting a notification.

alter table public.profiles
  add column notify_matches boolean not null default true,
  add column notify_messages boolean not null default true,
  add column notify_verifications boolean not null default true,
  add column notify_restitutions boolean not null default true;

-- Same dispatch as before, but each category now checks the RECIPIENT's own
-- preference first and skips the insert entirely if they've turned it off.
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
  v_closer_name text;
  v_wants_it boolean;
begin
  if me is null then
    raise exception 'Not authenticated';
  end if;

  if p_type not in (
    'message', 'verification_submitted', 'verification_confirmed', 'verification_rejected',
    'restitution_proposed', 'restitution_responded', 'restitution_confirmed',
    'restitution_pending_confirmation', 'chat_closed'
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

  select
    case
      when p_type = 'message' then notify_messages
      when p_type in ('verification_submitted', 'verification_confirmed', 'verification_rejected') then notify_verifications
      else notify_restitutions
    end
  into v_wants_it
  from public.profiles
  where id = recipient_id;

  if not coalesce(v_wants_it, true) then
    return;
  end if;

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
    when 'chat_closed' then
      select coalesce(full_name, 'Un utilisateur') into v_closer_name from public.profiles where id = me;
      v_title := 'Conversation arrêtée';
      v_body := format('%s a décidé d''arrêter la conversation.', v_closer_name);
  end case;

  insert into public.notifications (user_id, type, title, body, match_id)
  values (recipient_id, p_type, v_title, v_body, p_match_id);
end;
$$;

-- Fires to both sides at once when a match is first recorded — each side's
-- own notify_matches preference is checked independently.
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
  li_wants_it boolean;
  fi_wants_it boolean;
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

  select notify_matches into li_wants_it from public.profiles where id = li.user_id;
  select notify_matches into fi_wants_it from public.profiles where id = fi.user_id;

  insert into public.notifications (user_id, type, title, body, match_id)
  select v.user_id, 'match', 'Une correspondance a été trouvée !', v_body, p_match_id
  from (values (li.user_id, coalesce(li_wants_it, true)), (fi.user_id, coalesce(fi_wants_it, true))) as v(user_id, wants_it)
  where v.wants_it;
end;
$$;
