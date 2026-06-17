-- Add configurable sunrise and sunset times used for auto dark/light theme
-- and future push notification reminders
alter table rotation_settings
  add column if not exists sunrise_time time not null default '06:00',
  add column if not exists sunset_time  time not null default '18:00';
