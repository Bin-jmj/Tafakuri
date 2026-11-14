-- Atomic download counter - the route previously did a read-then-write,
-- which loses increments under concurrent requests.
create or replace function increment_media_download_count(media_id uuid)
returns void
language sql as $$
  update media_items set download_count = download_count + 1 where id = media_id;
$$;
