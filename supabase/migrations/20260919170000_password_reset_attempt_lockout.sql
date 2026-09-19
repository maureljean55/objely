-- App-level rate limit for password-reset requests, mirroring the login
-- lockout in 20260916190000_login_attempt_lockout.sql (see
-- 20260916191500_fix_login_lockout_fallthrough.sql too — every branch here
-- ends with a bare `return` after `return query select ...` for the same
-- reason: plpgsql keeps executing past a bare `return query` otherwise).
--
-- Unlike login, requestPasswordReset() has no success/failure outcome to
-- react to after the fact — Supabase's resetPasswordForEmail responds
-- identically whether or not the address is registered, by design, to
-- avoid leaking which emails have an account. So this is a single
-- check-and-increment call instead of a check/register pair: every call to
-- register_password_reset_attempt counts, regardless of what happens
-- afterwards. Without this, nothing in the app stopped someone who knows a
-- victim's address from submitting it on a loop and flooding their inbox
-- with reset links — Supabase's own platform-level rate limits (Dashboard >
-- Auth > Rate Limits) are the authoritative backstop, same as for login,
-- but this app-level cooldown is what actually surfaces a "please wait"
-- message in the UI instead of Supabase silently absorbing or rejecting it.
create table public.password_reset_attempts (
  identifier text primary key,
  attempt_count integer not null default 0,
  window_started_at timestamptz not null default now(),
  locked_until timestamptz
);

alter table public.password_reset_attempts enable row level security;
-- No policies: this table is only ever touched through the SECURITY DEFINER
-- functions below, so anon/authenticated get no direct table access at all.

create function public.check_password_reset_lockout(p_identifier text)
returns table (locked boolean, retry_after_seconds integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_locked_until timestamptz;
begin
  select locked_until into v_locked_until
    from public.password_reset_attempts
    where identifier = lower(trim(p_identifier));

  if v_locked_until is not null and v_locked_until > now() then
    return query select true, ceil(extract(epoch from (v_locked_until - now())))::integer;
    return;
  end if;

  return query select false, 0;
end;
$$;

create function public.register_password_reset_attempt(p_identifier text)
returns table (locked boolean, retry_after_seconds integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_identifier text := lower(trim(p_identifier));
  v_row public.password_reset_attempts%rowtype;
  v_max_attempts constant integer := 3;
  v_window_minutes constant integer := 60;
  v_lockout_minutes constant integer := 30;
begin
  select * into v_row from public.password_reset_attempts where identifier = v_identifier;

  if v_row.identifier is null then
    insert into public.password_reset_attempts (identifier, attempt_count, window_started_at)
    values (v_identifier, 1, now());
    return query select false, 0;
    return;
  end if;

  if v_row.locked_until is not null and v_row.locked_until > now() then
    return query select true, ceil(extract(epoch from (v_row.locked_until - now())))::integer;
    return;
  end if;

  -- Old enough that this is really a fresh run of attempts, not a continuation.
  if v_row.window_started_at < now() - (v_window_minutes || ' minutes')::interval then
    update public.password_reset_attempts
      set attempt_count = 1, window_started_at = now(), locked_until = null
      where identifier = v_identifier;
    return query select false, 0;
    return;
  end if;

  if v_row.attempt_count + 1 >= v_max_attempts then
    update public.password_reset_attempts
      set attempt_count = attempt_count + 1, locked_until = now() + (v_lockout_minutes || ' minutes')::interval
      where identifier = v_identifier;
    return query select true, v_lockout_minutes * 60;
    return;
  end if;

  update public.password_reset_attempts set attempt_count = attempt_count + 1 where identifier = v_identifier;
  return query select false, 0;
end;
$$;

revoke all on function public.check_password_reset_lockout(text) from public;
revoke all on function public.register_password_reset_attempt(text) from public;
grant execute on function public.check_password_reset_lockout(text) to anon, authenticated;
grant execute on function public.register_password_reset_attempt(text) to anon, authenticated;
