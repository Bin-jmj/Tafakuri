-- Hijri calendar admin correction (moon-sighting can lag the tabular
-- calculation by a day or two) + special-occasion content overrides
-- (Jummah, Ramadhani, Idd Fitri, Idd Adha, etc.) for the Aya/Hadith/Adhkar
-- home widgets. Purely additive — existing rotation logic is untouched and
-- is the fallback whenever no occasion is active.

alter table rotation_settings
  add column if not exists hijri_offset_days integer not null default 0;

alter table rotation_settings drop constraint if exists rotation_settings_hijri_offset_range;
alter table rotation_settings
  add constraint rotation_settings_hijri_offset_range check (hijri_offset_days between -3 and 3);

-- ---------------------------------------------------------------------
-- occasions
-- ---------------------------------------------------------------------
create table if not exists occasions (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  recurrence  text not null check (recurrence in ('weekly_friday', 'date_range')),
  start_date  date,
  end_date    date,
  priority    integer not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger occasions_set_updated_at
  before update on occasions
  for each row execute function set_updated_at();

alter table occasions enable row level security;

create policy "occasions_read" on occasions
  for select using (true);

create policy "occasions_admin" on occasions
  for all
  using ((select role from profiles where id = auth.uid()) = 'admin')
  with check ((select role from profiles where id = auth.uid()) = 'admin');

create index occasions_active_idx on occasions (is_active);

-- ---------------------------------------------------------------------
-- occasion_items — polymorphic pool of content shown during an occasion,
-- same content_type/content_id pattern already used by `bookmarks`.
-- ---------------------------------------------------------------------
create table if not exists occasion_items (
  id           uuid primary key default gen_random_uuid(),
  occasion_id  uuid not null references occasions(id) on delete cascade,
  content_type text not null check (content_type in ('hadith', 'dua', 'adhkar', 'quran_verse')),
  content_id   uuid not null,
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now(),
  unique (occasion_id, content_type, content_id)
);

alter table occasion_items enable row level security;

create policy "occasion_items_read" on occasion_items
  for select using (true);

create policy "occasion_items_admin" on occasion_items
  for all
  using ((select role from profiles where id = auth.uid()) = 'admin')
  with check ((select role from profiles where id = auth.uid()) = 'admin');

create index occasion_items_lookup_idx on occasion_items (occasion_id, content_type, sort_order);
