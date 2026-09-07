-- A brand new, unverified user hasn't earned any trust yet — only future
-- signups start at 0; this intentionally does not touch existing rows.
alter table profiles alter column trust_score set default 0;
