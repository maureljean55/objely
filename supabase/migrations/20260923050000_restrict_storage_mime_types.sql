-- Found via penetration testing: every storage bucket accepted any MIME
-- type — the `accept="image/*"` on file inputs is a client-side hint only,
-- trivially bypassed by uploading directly to the Storage API. Confirmed
-- exploitable: uploaded an SVG containing <script> straight to the public
-- avatars and item-photos buckets; it was accepted, stored, and served back
-- with Content-Type: image/svg+xml, executable if the URL is opened
-- directly (classic stored-XSS-via-SVG-upload). None of these buckets had
-- allowed_mime_types or file_size_limit set, so this also left every one of
-- them open to unbounded file sizes.
--
-- Restricting allowed_mime_types is enforced by Storage itself at upload
-- time — real defense, not just a friendlier error message — and doesn't
-- touch any client code, since every upload call site already only ever
-- sends the types listed here (see the `accept` attributes across the app).

update storage.buckets set allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'], file_size_limit = 5242880
where id in ('avatars', 'item-photos', 'community-covers', 'admin-avatars', 'identity-documents');

update storage.buckets set allowed_mime_types = array['audio/webm', 'audio/mp4', 'audio/ogg', 'audio/mpeg'], file_size_limit = 10485760
where id = 'voice-messages';

update storage.buckets set allowed_mime_types = array[
  'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'
], file_size_limit = 10485760
where id = 'message-attachments';

update storage.buckets set allowed_mime_types = array[
  'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf',
  'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'
], file_size_limit = 10485760
where id = 'support-attachments';
