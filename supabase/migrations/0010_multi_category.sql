-- Multi-category support across all content types.
-- category (single text) -> categories (text[]) on hadiths, duas, articles,
-- media_items. adhkar gets categories added fresh (it had no category
-- column before — it only had `slot`, which keeps driving the home page
-- rotation widget unchanged). An item can now belong to more than one
-- category and will appear under every one of them on the public pages.

-- array_to_string() is only STABLE in Postgres's catalog (it's polymorphic
-- over anyarray), so it can't be used directly inside a generated/stored
-- column. This wrapper is declared IMMUTABLE — safe because for text[] the
-- result is always deterministic.
create or replace function immutable_array_to_string(arr text[], sep text)
returns text
language sql
immutable
as $$
  select array_to_string(arr, sep)
$$;

-- ---------------------------------------------------------------------
-- hadiths
-- ---------------------------------------------------------------------
alter table hadiths add column if not exists categories text[] not null default '{}';
update hadiths set categories = array[category] where cardinality(categories) = 0;
alter table hadiths drop column if exists search;
alter table hadiths drop column if exists category;
alter table hadiths add column search tsvector generated always as (
  to_tsvector('simple', coalesce(translation_sw, '') || ' ' || coalesce(narrator, '') || ' ' || coalesce(source, '') || ' ' || coalesce(immutable_array_to_string(categories, ' '), ''))
) stored;
create index if not exists hadiths_search_idx on hadiths using gin (search);
create index if not exists hadiths_categories_idx on hadiths using gin (categories);
alter table hadiths drop constraint if exists hadiths_categories_not_empty;
alter table hadiths add constraint hadiths_categories_not_empty check (cardinality(categories) > 0);

-- ---------------------------------------------------------------------
-- duas
-- ---------------------------------------------------------------------
alter table duas add column if not exists categories text[] not null default '{}';
update duas set categories = array[category] where cardinality(categories) = 0;
alter table duas drop column if exists search;
alter table duas drop column if exists category;
alter table duas add column search tsvector generated always as (
  to_tsvector('simple', coalesce(translation_sw, '') || ' ' || coalesce(immutable_array_to_string(categories, ' '), '') || ' ' || coalesce(occasion, ''))
) stored;
create index if not exists duas_search_idx on duas using gin (search);
create index if not exists duas_categories_idx on duas using gin (categories);
alter table duas drop constraint if exists duas_categories_not_empty;
alter table duas add constraint duas_categories_not_empty check (cardinality(categories) > 0);

-- ---------------------------------------------------------------------
-- articles
-- ---------------------------------------------------------------------
alter table articles add column if not exists categories text[] not null default '{}';
update articles set categories = array[category] where cardinality(categories) = 0;
alter table articles drop column if exists search;
alter table articles drop column if exists category;
alter table articles add column search tsvector generated always as (
  to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(content, '') || ' ' || coalesce(immutable_array_to_string(categories, ' '), '') || ' ' || coalesce(author, ''))
) stored;
create index if not exists articles_search_idx on articles using gin (search);
create index if not exists articles_categories_idx on articles using gin (categories);
alter table articles drop constraint if exists articles_categories_not_empty;
alter table articles add constraint articles_categories_not_empty check (cardinality(categories) > 0);

-- ---------------------------------------------------------------------
-- media_items
-- ---------------------------------------------------------------------
alter table media_items add column if not exists categories text[] not null default '{}';
update media_items set categories = array[category] where cardinality(categories) = 0;
drop index if exists media_items_type_idx;
alter table media_items drop column if exists search;
alter table media_items drop column if exists category;
alter table media_items add column search tsvector generated always as (
  to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(author, '') || ' ' || coalesce(description, '') || ' ' || coalesce(immutable_array_to_string(categories, ' '), ''))
) stored;
create index if not exists media_items_search_idx on media_items using gin (search);
create index if not exists media_items_categories_idx on media_items using gin (categories);
create index if not exists media_items_type_idx on media_items (type);
alter table media_items drop constraint if exists media_items_categories_not_empty;
alter table media_items add constraint media_items_categories_not_empty check (cardinality(categories) > 0);

-- ---------------------------------------------------------------------
-- adhkar — categories added fresh (no prior category column existed)
-- ---------------------------------------------------------------------
alter table adhkar add column if not exists categories text[] not null default '{}';
update adhkar set categories = array[case slot when 'asubuhi' then 'Asubuhi' when 'jioni' then 'Jioni' else 'Asubuhi' end] where cardinality(categories) = 0;
create index if not exists adhkar_categories_idx on adhkar using gin (categories);
alter table adhkar drop constraint if exists adhkar_categories_not_empty;
alter table adhkar add constraint adhkar_categories_not_empty check (cardinality(categories) > 0);

-- ---------------------------------------------------------------------
-- categories table — the adhkar rows seeded in 0007 were never wired to a
-- column. Replace them with the real set used by the new /adhkar page.
-- ---------------------------------------------------------------------
delete from categories where type = 'adhkar';

insert into categories (name, slug, type, sort_order) values
  ('Asubuhi',         'asubuhi',          'adhkar', 1),
  ('Jioni',           'jioni',            'adhkar', 2),
  ('Sala',            'sala',             'adhkar', 3),
  ('Baada ya Sala',   'baada-ya-sala',    'adhkar', 4),
  ('Tahajjud',        'tahajjud',         'adhkar', 5),
  ('Kabla ya Kulala', 'kabla-ya-kulala',  'adhkar', 6),
  ('Kuamka',          'kuamka',           'adhkar', 7),
  ('Safari',          'safari',           'adhkar', 8)
on conflict (type, slug) do nothing;
