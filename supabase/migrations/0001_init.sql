-- ============================================================================
-- Tafakuri — initial schema
-- Run via: supabase db push  (or paste into the SQL editor of your project)
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- Helper: keep updated_at fresh
-- ----------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- profiles — one row per auth.users, holds role for authorization
-- ----------------------------------------------------------------------------
create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  role        text not null default 'user' check (role in ('user', 'admin')),
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on profiles
  for each row execute function set_updated_at();

-- Auto-create a profile row whenever a new auth user signs up.
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Helper used throughout RLS policies below.
create or replace function is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- ----------------------------------------------------------------------------
-- surahs — static reference table (114 rows, seeded once)
-- ----------------------------------------------------------------------------
create table surahs (
  id               int primary key,
  name             text not null,
  arabic_name      text not null,
  number_of_verses int not null,
  revelation_type  text not null check (revelation_type in ('Makki', 'Madani')),
  juz_start        int not null
);

-- ----------------------------------------------------------------------------
-- quran_verses
-- ----------------------------------------------------------------------------
create table quran_verses (
  id               uuid primary key default gen_random_uuid(),
  surah_number     int not null references surahs(id),
  verse_number     int not null,
  arabic_text      text not null,
  translation_sw   text not null,
  tafsir           text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  search           tsvector generated always as (to_tsvector('simple', coalesce(translation_sw, '') || ' ' || coalesce(tafsir, ''))) stored,
  unique (surah_number, verse_number)
);

create index quran_verses_search_idx on quran_verses using gin (search);
create index quran_verses_surah_idx on quran_verses (surah_number);

create trigger quran_verses_set_updated_at
  before update on quran_verses
  for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- hadiths
-- ----------------------------------------------------------------------------
create table hadiths (
  id               uuid primary key default gen_random_uuid(),
  arabic_text      text not null,
  translation_sw   text not null,
  narrator         text not null,
  source           text not null,
  category         text not null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  search           tsvector generated always as (to_tsvector('simple', coalesce(translation_sw, '') || ' ' || coalesce(narrator, '') || ' ' || coalesce(source, '') || ' ' || coalesce(category, ''))) stored
);

create index hadiths_search_idx on hadiths using gin (search);

create trigger hadiths_set_updated_at
  before update on hadiths
  for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- duas
-- ----------------------------------------------------------------------------
create table duas (
  id               uuid primary key default gen_random_uuid(),
  arabic_text      text not null,
  translation_sw   text not null,
  transliteration  text,
  category         text not null,
  occasion         text,
  reference        text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  search           tsvector generated always as (to_tsvector('simple', coalesce(translation_sw, '') || ' ' || coalesce(category, '') || ' ' || coalesce(occasion, ''))) stored
);

create index duas_search_idx on duas using gin (search);

create trigger duas_set_updated_at
  before update on duas
  for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- adhkar
-- ----------------------------------------------------------------------------
create table adhkar (
  id               uuid primary key default gen_random_uuid(),
  arabic_text      text not null,
  translation_sw   text not null,
  transliteration  text,
  count            int not null default 1,
  benefit          text,
  reference        text,
  slot             text not null check (slot in ('asubuhi', 'jioni')),
  sort_order       int not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index adhkar_slot_idx on adhkar (slot, sort_order);

create trigger adhkar_set_updated_at
  before update on adhkar
  for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- articles
-- ----------------------------------------------------------------------------
create table articles (
  id               uuid primary key default gen_random_uuid(),
  title            text not null,
  content          text not null,
  category         text not null,
  author           text not null,
  published_date   date not null default current_date,
  image_url        text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  search           tsvector generated always as (to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(content, '') || ' ' || coalesce(category, '') || ' ' || coalesce(author, ''))) stored
);

create index articles_search_idx on articles using gin (search);
create index articles_published_idx on articles (published_date desc);

create trigger articles_set_updated_at
  before update on articles
  for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- media_items — books, audio, video (files live on Google Drive)
-- ----------------------------------------------------------------------------
create table media_items (
  id               uuid primary key default gen_random_uuid(),
  type             text not null check (type in ('book', 'audio', 'video')),
  title            text not null,
  author           text,
  description      text,
  category         text not null,
  language         text not null default 'Swahili',
  cover_url        text,
  drive_file_id    text,
  drive_mime_type  text,
  file_size_bytes  bigint,
  total_pages      int,
  duration_seconds int,
  published_year   text,
  download_count   int not null default 0,
  is_available     boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  search           tsvector generated always as (to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(author, '') || ' ' || coalesce(description, '') || ' ' || coalesce(category, ''))) stored
);

create index media_items_search_idx on media_items using gin (search);
create index media_items_type_idx on media_items (type, category);

create trigger media_items_set_updated_at
  before update on media_items
  for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- bookmarks — one row per user per saved item, across all content types
-- ----------------------------------------------------------------------------
create table bookmarks (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  content_type  text not null check (content_type in ('quran_verse', 'hadith', 'dua', 'adhkar', 'article', 'media')),
  content_id    uuid not null,
  created_at    timestamptz not null default now(),
  unique (user_id, content_type, content_id)
);

create index bookmarks_user_idx on bookmarks (user_id);

-- ----------------------------------------------------------------------------
-- google_drive_tokens — single row, holds the admin's encrypted refresh token
-- ----------------------------------------------------------------------------
create table google_drive_tokens (
  id              int primary key default 1 check (id = 1),
  refresh_token   text,
  connected_email text,
  books_folder_id text,
  audio_folder_id text,
  video_folder_id text,
  updated_at      timestamptz not null default now()
);

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table profiles enable row level security;
alter table surahs enable row level security;
alter table quran_verses enable row level security;
alter table hadiths enable row level security;
alter table duas enable row level security;
alter table adhkar enable row level security;
alter table articles enable row level security;
alter table media_items enable row level security;
alter table bookmarks enable row level security;
alter table google_drive_tokens enable row level security;

-- profiles: users read/update their own row; admins read all.
create policy "profiles_select_own_or_admin" on profiles
  for select using (id = auth.uid() or is_admin());

create policy "profiles_update_own" on profiles
  for update using (id = auth.uid());

create policy "profiles_admin_update_any" on profiles
  for update using (is_admin());

-- Reference/content tables: anyone can read, only admins can write.
create policy "surahs_read_all" on surahs for select using (true);
create policy "surahs_admin_write" on surahs for all using (is_admin()) with check (is_admin());

create policy "quran_verses_read_all" on quran_verses for select using (true);
create policy "quran_verses_admin_write" on quran_verses for all using (is_admin()) with check (is_admin());

create policy "hadiths_read_all" on hadiths for select using (true);
create policy "hadiths_admin_write" on hadiths for all using (is_admin()) with check (is_admin());

create policy "duas_read_all" on duas for select using (true);
create policy "duas_admin_write" on duas for all using (is_admin()) with check (is_admin());

create policy "adhkar_read_all" on adhkar for select using (true);
create policy "adhkar_admin_write" on adhkar for all using (is_admin()) with check (is_admin());

create policy "articles_read_all" on articles for select using (true);
create policy "articles_admin_write" on articles for all using (is_admin()) with check (is_admin());

-- media_items: public can read available items; admins read/write everything.
create policy "media_items_read_available" on media_items
  for select using (is_available or is_admin());
create policy "media_items_admin_write" on media_items
  for all using (is_admin()) with check (is_admin());

-- bookmarks: users manage only their own.
create policy "bookmarks_owner_all" on bookmarks
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- google_drive_tokens: no anon/authenticated policies — only the service role
-- (which bypasses RLS) may read or write this table.

-- ============================================================================
-- Daily picks — computed per-request so content rotates without rebuilding
-- ============================================================================
create or replace function get_daily_hadith()
returns hadiths
language sql stable as $$
  select * from hadiths
  order by id
  offset (extract(doy from current_date)::int % greatest((select count(*) from hadiths)::int, 1))
  limit 1
$$;

create or replace function get_daily_dua()
returns duas
language sql stable as $$
  select * from duas
  order by id
  offset (extract(doy from current_date)::int % greatest((select count(*) from duas)::int, 1))
  limit 1
$$;

-- ============================================================================
-- Full-text search RPCs (used by the public search bar)
-- ============================================================================
create or replace function search_quran_verses(query text, max_results int default 20)
returns setof quran_verses
language sql stable as $$
  select * from quran_verses
  where search @@ websearch_to_tsquery('simple', query)
  order by ts_rank(search, websearch_to_tsquery('simple', query)) desc
  limit max_results
$$;

create or replace function search_hadiths(query text, max_results int default 20)
returns setof hadiths
language sql stable as $$
  select * from hadiths
  where search @@ websearch_to_tsquery('simple', query)
  order by ts_rank(search, websearch_to_tsquery('simple', query)) desc
  limit max_results
$$;

create or replace function search_duas(query text, max_results int default 20)
returns setof duas
language sql stable as $$
  select * from duas
  where search @@ websearch_to_tsquery('simple', query)
  order by ts_rank(search, websearch_to_tsquery('simple', query)) desc
  limit max_results
$$;

create or replace function search_articles(query text, max_results int default 20)
returns setof articles
language sql stable as $$
  select * from articles
  where search @@ websearch_to_tsquery('simple', query)
  order by ts_rank(search, websearch_to_tsquery('simple', query)) desc
  limit max_results
$$;

create or replace function search_media_items(query text, max_results int default 20)
returns setof media_items
language sql stable as $$
  select * from media_items
  where is_available and search @@ websearch_to_tsquery('simple', query)
  order by ts_rank(search, websearch_to_tsquery('simple', query)) desc
  limit max_results
$$;
