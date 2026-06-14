-- ============================================================================
-- Storage — public bucket for article/media cover images
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('covers', 'covers', true)
on conflict (id) do nothing;

-- Anyone can view cover images (the bucket is public).
create policy "covers_public_read" on storage.objects
  for select using (bucket_id = 'covers');

-- Only admins can upload/replace/delete cover images.
create policy "covers_admin_write" on storage.objects
  for insert with check (bucket_id = 'covers' and is_admin());

create policy "covers_admin_update" on storage.objects
  for update using (bucket_id = 'covers' and is_admin());

create policy "covers_admin_delete" on storage.objects
  for delete using (bucket_id = 'covers' and is_admin());
