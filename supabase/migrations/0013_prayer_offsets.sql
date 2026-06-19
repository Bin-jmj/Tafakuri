-- Per-prayer minute corrections for the astronomically-calculated prayer
-- times (lib/utils/prayer-times.ts). Real-world discrepancies against local
-- announced times are almost always method-specific (Fajr/Isha depend on an
-- assumed sun-angle convention that local authorities define differently),
-- so each prayer gets its own adjustable offset rather than one global shift.

alter table rotation_settings
  add column if not exists prayer_offset_fajr integer not null default 0,
  add column if not exists prayer_offset_dhuhr integer not null default 0,
  add column if not exists prayer_offset_asr integer not null default 0,
  add column if not exists prayer_offset_maghrib integer not null default 0,
  add column if not exists prayer_offset_isha integer not null default 0;

alter table rotation_settings drop constraint if exists rotation_settings_prayer_offset_range;
alter table rotation_settings add constraint rotation_settings_prayer_offset_range check (
  prayer_offset_fajr between -15 and 15
  and prayer_offset_dhuhr between -15 and 15
  and prayer_offset_asr between -15 and 15
  and prayer_offset_maghrib between -15 and 15
  and prayer_offset_isha between -15 and 15
);
