-- Items can now have multiple colors (see the report-lost/report-found
-- step-2 multi-select). Replace the single "color" text column with a real
-- "colors" text[] column instead of keeping the comma-joined string that
-- was used as a stopgap. Existing values (single color, or already a
-- "Noir, Bleu"-style joined string) are split into a proper array.
alter table items rename column color to colors;

alter table items
  alter column colors type text[]
  using case
    when colors is null or trim(colors) = '' then null
    else (select array_agg(trim(c)) from unnest(string_to_array(colors, ',')) as c)
  end;
