-- Tracks how far each user has read into a book or article, so they can
-- resume where they left off.
create table reading_progress (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  content_type     text not null check (content_type in ('book', 'article')),
  content_id       uuid not null,
  progress_percent numeric not null default 0,
  current_page     int,
  total_pages      int,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (user_id, content_type, content_id)
);

create index reading_progress_user_idx on reading_progress (user_id);

create trigger reading_progress_set_updated_at
  before update on reading_progress
  for each row execute function set_updated_at();

alter table reading_progress enable row level security;

-- reading_progress: users manage only their own.
create policy "reading_progress_owner_all" on reading_progress
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
