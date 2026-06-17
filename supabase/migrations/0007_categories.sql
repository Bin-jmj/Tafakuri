-- Categories table: master list for all content category types
-- Used as a source of truth for admin dropdown options
-- Deleting a category never deletes content (content keeps its text value)

create table if not exists categories (
  id          uuid        primary key default gen_random_uuid(),
  name        text        not null,
  slug        text        not null,
  type        text        not null check (type in ('hadith', 'dua', 'adhkar', 'article', 'media')),
  description text,
  sort_order  integer     not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (type, slug)
);

create trigger categories_set_updated_at
  before update on categories
  for each row execute function set_updated_at();

alter table categories enable row level security;

-- Public read
create policy "categories_read" on categories
  for select using (true);

-- Admin write
create policy "categories_admin" on categories
  for all
  using ((select role from profiles where id = auth.uid()) = 'admin')
  with check ((select role from profiles where id = auth.uid()) = 'admin');

-- ── Seed: Hadith categories ────────────────────────────────────────────────
insert into categories (name, slug, type, sort_order) values
  ('Imani',    'imani',    'hadith', 1),
  ('Ibada',    'ibada',    'hadith', 2),
  ('Akhlaq',   'akhlaq',   'hadith', 3),
  ('Familia',  'familia',  'hadith', 4),
  ('Elimu',    'elimu',    'hadith', 5),
  ('Sadaka',   'sadaka',   'hadith', 6),
  ('Adabu',    'adabu',    'hadith', 7),
  ('Afya',     'afya',     'hadith', 8),
  ('Faraja',   'faraja',   'hadith', 9)
on conflict (type, slug) do nothing;

-- ── Seed: Dua categories ──────────────────────────────────────────────────
insert into categories (name, slug, type, sort_order) values
  ('Kila Siku',    'kila-siku',    'dua', 1),
  ('Kuanza Jambo', 'kuanza-jambo', 'dua', 2),
  ('Shukrani',     'shukrani',     'dua', 3),
  ('Qurani',       'qurani',       'dua', 4),
  ('Elimu',        'elimu',        'dua', 5),
  ('Faraja',       'faraja',       'dua', 6),
  ('Afya',         'afya',         'dua', 7),
  ('Chakula',      'chakula',      'dua', 8),
  ('Safari',       'safari',       'dua', 9),
  ('Imani',        'imani',        'dua', 10),
  ('Familia',      'familia',      'dua', 11)
on conflict (type, slug) do nothing;

-- ── Seed: Adhkar categories ───────────────────────────────────────────────
insert into categories (name, slug, type, sort_order) values
  ('Adhkar za Asubuhi', 'adhkar-asubuhi', 'adhkar', 1),
  ('Adhkar za Jioni',   'adhkar-jioni',   'adhkar', 2),
  ('Adhkar Zote',       'adhkar-zote',    'adhkar', 3)
on conflict (type, slug) do nothing;

-- ── Seed: Article categories ──────────────────────────────────────────────
insert into categories (name, slug, type, sort_order) values
  ('Hadithi', 'hadithi', 'article', 1),
  ('Fiqh',    'fiqh',    'article', 2),
  ('Tafsiri', 'tafsiri', 'article', 3),
  ('Akida',   'akida',   'article', 4),
  ('Siira',   'siira',   'article', 5),
  ('Lugha',   'lugha',   'article', 6),
  ('Tarbiya', 'tarbiya', 'article', 7)
on conflict (type, slug) do nothing;

-- ── Seed: Media categories ────────────────────────────────────────────────
insert into categories (name, slug, type, sort_order) values
  ('Hadithi', 'hadithi', 'media', 1),
  ('Fiqh',    'fiqh',    'media', 2),
  ('Tafsiri', 'tafsiri', 'media', 3),
  ('Akida',   'akida',   'media', 4),
  ('Siira',   'siira',   'media', 5),
  ('Lugha',   'lugha',   'media', 6),
  ('Tarbiya', 'tarbiya', 'media', 7)
on conflict (type, slug) do nothing;
