-- New feature: either match participant can end the conversation at any
-- time. Ending it doesn't touch the match's own status (still "confirmed" —
-- the match itself and its restitution history stay intact) or the message
-- history (kept, read-only), it only stops new messages and disables the
-- "Discuter" entry point on the Activity card for both sides.

alter table public.matches
  add column chat_closed_at timestamptz,
  add column chat_closed_by uuid references auth.users (id);

create or replace function public.close_chat(p_match_id uuid)
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

  -- Idempotent: a second call (e.g. a client retry) just returns the
  -- already-closed row instead of re-timestamping/re-attributing it.
  if m.chat_closed_at is not null then
    return m;
  end if;

  update public.matches
  set chat_closed_at = now(), chat_closed_by = me
  where id = p_match_id
  returning * into updated;

  return updated;
end;
$$;

revoke all on function public.close_chat(uuid) from public;
grant execute on function public.close_chat(uuid) to authenticated;

-- Block new messages once either side has closed the chat, on top of the
-- existing "match must be confirmed" requirement.
drop policy "Confirmed match participants can send messages" on public.messages;

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
        and matches.chat_closed_at is null
        and (li.user_id = auth.uid() or fi.user_id = auth.uid())
    )
  );

-- Extend notify_match_participant with a "chat_closed" type whose body names
-- the person who closed it — the only notification type here that needs a
-- profile name rather than an item title.
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
