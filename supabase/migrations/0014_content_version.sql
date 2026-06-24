-- Tracks a single incrementing "content version" that bumps on ANY insert,
-- update, OR delete to the core reference content (hadiths, duas, adhkar,
-- quran_verses). Deletions don't show up in updated_at, so a plain
-- max(updated_at) check would miss a removed Hadith/Adhkar — this trigger-
-- driven counter catches every kind of change. The PWA service worker uses
-- this to know when to refresh its full offline precache of this content.

create table if not exists content_meta (
  id          int primary key default 1,
  version     bigint not null default 1,
  updated_at  timestamptz not null default now(),
  constraint content_meta_singleton check (id = 1)
);

insert into content_meta (id, version) values (1, 1)
on conflict (id) do nothing;

alter table content_meta enable row level security;

create policy "content_meta_read" on content_meta
  for select using (true);

create or replace function bump_content_version()
returns trigger
language plpgsql as $$
begin
  update content_meta set version = version + 1, updated_at = now() where id = 1;
  return null;
end;
$$;

drop trigger if exists hadiths_bump_content_version on hadiths;
create trigger hadiths_bump_content_version
  after insert or update or delete on hadiths
  for each statement execute function bump_content_version();

drop trigger if exists duas_bump_content_version on duas;
create trigger duas_bump_content_version
  after insert or update or delete on duas
  for each statement execute function bump_content_version();

drop trigger if exists adhkar_bump_content_version on adhkar;
create trigger adhkar_bump_content_version
  after insert or update or delete on adhkar
  for each statement execute function bump_content_version();

drop trigger if exists quran_verses_bump_content_version on quran_verses;
create trigger quran_verses_bump_content_version
  after insert or update or delete on quran_verses
  for each statement execute function bump_content_version();
