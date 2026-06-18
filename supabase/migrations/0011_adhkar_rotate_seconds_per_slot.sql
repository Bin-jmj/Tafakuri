-- Asubuhi and Jioni adhkar lists can have different numbers of entries, so a
-- single shared rotation duration doesn't fit both well. Split
-- adhkar_rotate_seconds into two independent per-slot settings.

alter table rotation_settings
  add column if not exists adhkar_asubuhi_rotate_seconds integer not null default 30,
  add column if not exists adhkar_jioni_rotate_seconds integer not null default 30;

update rotation_settings set
  adhkar_asubuhi_rotate_seconds = coalesce(adhkar_rotate_seconds, 30),
  adhkar_jioni_rotate_seconds = coalesce(adhkar_rotate_seconds, 30)
where id = 1;

alter table rotation_settings drop column if exists adhkar_rotate_seconds;
