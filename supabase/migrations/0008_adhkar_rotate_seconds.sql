-- Add admin-configurable per-card rotation interval for the Adhkar widget
alter table rotation_settings
  add column if not exists adhkar_rotate_seconds integer not null default 30;
