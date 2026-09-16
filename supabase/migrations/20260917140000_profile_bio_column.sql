-- profile/edit's "À propos de moi" field had nowhere to be saved — the
-- profiles table never had a bio column, so the field was pure decoration.
alter table public.profiles add column bio text;
