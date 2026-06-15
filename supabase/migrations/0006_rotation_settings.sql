-- ============================================================================
-- Admin-editable time slots that control how often "Aya ya Leo", "Hadith ya
-- Leo" and the Adhkar widget rotate their content. Singleton settings row,
-- editable from /admin/settings/muda — no code changes needed to retune.
-- ============================================================================

create table rotation_settings (
  id                   smallint primary key default 1 check (id = 1),
  adhkar_asubuhi_start time not null default '05:00',
  adhkar_jioni_start   time not null default '12:00',
  content_fajr_start    time not null default '05:00',
  content_dhuhr_start   time not null default '12:30',
  content_asr_start     time not null default '15:45',
  content_maghrib_start time not null default '18:30',
  content_isha_start    time not null default '19:45',
  updated_at           timestamptz not null default now()
);

insert into rotation_settings (id) values (1) on conflict (id) do nothing;

alter table rotation_settings enable row level security;

create policy "rotation_settings_read_all" on rotation_settings for select using (true);
create policy "rotation_settings_admin_write" on rotation_settings for all using (is_admin()) with check (is_admin());

-- ============================================================================
-- Daily picks now accept a slot index (0-4, one per prayer-time window) so
-- "Aya ya Leo" and "Hadith ya Leo" rotate 5 times a day instead of once.
-- ============================================================================

create or replace function get_daily_hadith(p_slot int default 0)
returns hadiths
language sql stable as $$
  select * from hadiths
  order by id
  offset ((extract(doy from current_date)::int * 5 + p_slot) % greatest((select count(*) from hadiths)::int, 1))
  limit 1
$$;

create or replace function get_daily_verse(p_slot int default 0)
returns quran_verses
language sql stable as $$
  select * from quran_verses
  order by id
  offset ((extract(doy from current_date)::int * 5 + p_slot) % greatest((select count(*) from quran_verses)::int, 1))
  limit 1
$$;
