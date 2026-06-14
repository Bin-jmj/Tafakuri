-- ============================================================================
-- Nightly job: re-check that each media_item's Google Drive file still exists
-- and flip is_available accordingly. The actual Drive lookup happens in the
-- "check-media-availability" Edge Function (supabase/functions); this
-- migration just schedules it.
-- ============================================================================

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Replace <PROJECT_REF> and <ANON_OR_SERVICE_KEY> after deploying the
-- function, or set them via `select cron.alter_job(...)` from the dashboard.
-- This is left commented out by default so a fresh project doesn't fail to
-- migrate before the Edge Function exists.

-- select cron.schedule(
--   'check-media-availability-nightly',
--   '0 2 * * *', -- 02:00 every day
--   $$
--   select net.http_post(
--     url := 'https://<PROJECT_REF>.supabase.co/functions/v1/check-media-availability',
--     headers := jsonb_build_object(
--       'Authorization', 'Bearer <SERVICE_ROLE_KEY>',
--       'Content-Type', 'application/json'
--     ),
--     body := '{}'::jsonb
--   );
--   $$
-- );
