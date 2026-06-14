-- ============================================================================
-- Daily Qur'an verse with "moral" (fundisho/somo) lesson text, plus a
-- get_daily_verse() RPC mirroring get_daily_hadith()/get_daily_dua().
-- ============================================================================

alter table quran_verses add column if not exists moral text;

create or replace function get_daily_verse()
returns quran_verses
language sql stable as $$
  select * from quran_verses
  order by id
  offset (extract(doy from current_date)::int % greatest((select count(*) from quran_verses)::int, 1))
  limit 1
$$;
