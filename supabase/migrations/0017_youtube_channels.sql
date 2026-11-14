-- ============================================================================
-- youtube_channels — admin-curated YouTube playlists, embedded directly on
-- the public /video page (no YouTube Data API / key / sync job - the
-- playlist_id is embedded via https://www.youtube-nocookie.com/embed/...).
-- ============================================================================

create table if not exists youtube_channels (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  description  text,
  playlist_id  text not null,
  channel_url  text,
  cover_url    text,
  categories   text[] not null default '{}',
  sort_order   integer not null default 0,
  is_available boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table youtube_channels enable row level security;

create policy "youtube_channels_read" on youtube_channels
  for select using (true);

create policy "youtube_channels_admin" on youtube_channels
  for all using (is_admin()) with check (is_admin());

create trigger youtube_channels_set_updated_at
  before update on youtube_channels
  for each row execute function set_updated_at();
