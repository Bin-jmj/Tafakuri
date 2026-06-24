-- ============================================================================
-- Storage — private bucket for book/audio/video files, replacing Google
-- Drive as the storage/delivery backend (Drive is not an approved use case
-- for proxying a public site's file traffic - see docs/ARCHITECTURE.md).
-- Private (not public like `covers`) so access still goes through the app's
-- signed-URL route, preserving today's is_available gating and download
-- counting instead of exposing files directly via a public bucket URL.
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('media', 'media', false)
on conflict (id) do nothing;

create policy "media_admin_insert" on storage.objects
  for insert with check (bucket_id = 'media' and is_admin());

create policy "media_admin_update" on storage.objects
  for update using (bucket_id = 'media' and is_admin());

create policy "media_admin_delete" on storage.objects
  for delete using (bucket_id = 'media' and is_admin());

alter table media_items add column if not exists storage_path text;
