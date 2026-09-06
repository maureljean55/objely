-- Public bucket for lost/found item photos. Files are stored as
-- "<user_id>/<filename>" so ownership can be checked from the path alone.
insert into storage.buckets (id, name, public)
values ('item-photos', 'item-photos', true)
on conflict (id) do nothing;

create policy "Item photos are publicly readable"
  on storage.objects for select
  using (bucket_id = 'item-photos');

create policy "Users can upload their own item photos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'item-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can update their own item photos"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'item-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can delete their own item photos"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'item-photos' and (storage.foldername(name))[1] = auth.uid()::text);
