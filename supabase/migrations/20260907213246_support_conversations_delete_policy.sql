-- Missing from the original support_chat migration: without this, a DELETE
-- silently matches zero rows under RLS instead of actually removing anything.
create policy "Users can delete their own support conversations"
  on public.support_conversations for delete
  to authenticated
  using (auth.uid() = user_id);
