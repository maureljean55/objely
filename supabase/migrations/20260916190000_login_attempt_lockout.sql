-- App-level login lockout: the login form calls check_login_lockout before
-- attempting sign-in, and register_login_attempt after, so repeated wrong
-- passwords against one account get slowed down without a page reload or
-- any state the client controls (clearing localStorage doesn't help — the
-- counter lives here). This is a UX/defense-in-depth layer on top of
-- Supabase's own platform-level auth rate limits (Dashboard > Auth > Rate
-- Limits), which remain the authoritative protection since they apply even
-- to a caller that skips this app's UI entirely and hits Supabase directly
-- with the (necessarily public) anon key.
create table public.login_attempts (
  identifier text primary key,
  attempt_count integer not null default 0,
  window_started_at timestamptz not null default now(),
  locked_until timestamptz
);

alter table public.login_attempts enable row level security;
-- No policies: this table is only ever touched through the SECURITY DEFINER
-- functions below, so anon/authenticated get no direct table access at all.

create function public.check_login_lockout(p_identifier text)
returns table (locked boolean, retry_after_seconds integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_locked_until timestamptz;
begin
  select locked_until into v_locked_until
    from public.login_attempts
    where identifier = lower(trim(p_identifier));

  if v_locked_until is not null and v_locked_until > now() then
    return query select true, ceil(extract(epoch from (v_locked_until - now())))::integer;
  end if;

  return query select false, 0;
end;
$$;

create function public.register_login_attempt(p_identifier text, p_success boolean)
returns table (locked boolean, retry_after_seconds integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_identifier text := lower(trim(p_identifier));
  v_row public.login_attempts%rowtype;
  v_max_attempts constant integer := 5;
  v_window_minutes constant integer := 15;
  v_lockout_minutes constant integer := 15;
begin
  if p_success then
    delete from public.login_attempts where identifier = v_identifier;
    return query select false, 0;
  end if;

  select * into v_row from public.login_attempts where identifier = v_identifier;

  if v_row.identifier is null then
    insert into public.login_attempts (identifier, attempt_count, window_started_at)
    values (v_identifier, 1, now());
    return query select false, 0;
  end if;

  if v_row.locked_until is not null and v_row.locked_until > now() then
    return query select true, ceil(extract(epoch from (v_row.locked_until - now())))::integer;
  end if;

  -- Old enough that this is really a fresh run of attempts, not a continuation.
  if v_row.window_started_at < now() - (v_window_minutes || ' minutes')::interval then
    update public.login_attempts
      set attempt_count = 1, window_started_at = now(), locked_until = null
      where identifier = v_identifier;
    return query select false, 0;
  end if;

  if v_row.attempt_count + 1 >= v_max_attempts then
    update public.login_attempts
      set attempt_count = attempt_count + 1, locked_until = now() + (v_lockout_minutes || ' minutes')::interval
      where identifier = v_identifier;
    return query select true, v_lockout_minutes * 60;
  end if;

  update public.login_attempts set attempt_count = attempt_count + 1 where identifier = v_identifier;
  return query select false, 0;
end;
$$;

revoke all on function public.check_login_lockout(text) from public;
revoke all on function public.register_login_attempt(text, boolean) from public;
grant execute on function public.check_login_lockout(text) to anon, authenticated;
grant execute on function public.register_login_attempt(text, boolean) to anon, authenticated;
