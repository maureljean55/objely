-- Fix: the previous migration's plpgsql functions used `return query select
-- ...` without a following bare `return`, which in plpgsql appends a row and
-- keeps executing rather than exiting. Every one of the four independent
-- `if` blocks in each function could therefore fire in the same call,
-- producing multiple rows and — worse — double-incrementing attempt_count
-- whenever execution fell through into the final unconditional branch,
-- which tripped the lockout a full attempt earlier than intended.
create or replace function public.check_login_lockout(p_identifier text)
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
    return;
  end if;

  return query select false, 0;
end;
$$;

create or replace function public.register_login_attempt(p_identifier text, p_success boolean)
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
    return;
  end if;

  select * into v_row from public.login_attempts where identifier = v_identifier;

  if v_row.identifier is null then
    insert into public.login_attempts (identifier, attempt_count, window_started_at)
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
    update public.login_attempts
      set attempt_count = 1, window_started_at = now(), locked_until = null
      where identifier = v_identifier;
    return query select false, 0;
    return;
  end if;

  if v_row.attempt_count + 1 >= v_max_attempts then
    update public.login_attempts
      set attempt_count = attempt_count + 1, locked_until = now() + (v_lockout_minutes || ' minutes')::interval
      where identifier = v_identifier;
    return query select true, v_lockout_minutes * 60;
    return;
  end if;

  update public.login_attempts set attempt_count = attempt_count + 1 where identifier = v_identifier;
  return query select false, 0;
end;
$$;

-- Clean up rows created while diagnosing the bug above.
delete from public.login_attempts where identifier like '%@example.com';
