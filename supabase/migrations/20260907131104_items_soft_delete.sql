-- Soft delete: a user removing a declaration from "Mes objets" doesn't
-- erase the row (matches/messages/notifications reference it, and admins
-- should still be able to review it on their own page later). Deleted items
-- are simply excluded from the owner's list, matching candidates, and the
-- home feed via `deleted_at is null` filters in the app.
alter table items
  add column deleted_at timestamptz,
  add column resolved_before_deletion boolean,
  add column deletion_reason text;
