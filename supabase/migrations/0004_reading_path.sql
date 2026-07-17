-- Reading Path: an ordered plan of books to read next, drawn from the
-- user's existing library. Notes and page progress live on the book
-- itself (public.books) rather than on the path item, so they read
-- identically whether opened from the library grid or from the path.

alter table public.books
  add column if not exists current_page integer,
  add column if not exists total_pages integer;

create table if not exists public.reading_paths (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  name       text not null default 'My Reading Path',
  created_at timestamptz not null default now()
);

alter table public.reading_paths enable row level security;

create policy "reading_paths_select_own" on public.reading_paths
  for select using (auth.uid() = user_id);
create policy "reading_paths_insert_own" on public.reading_paths
  for insert with check (auth.uid() = user_id);
create policy "reading_paths_update_own" on public.reading_paths
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "reading_paths_delete_own" on public.reading_paths
  for delete using (auth.uid() = user_id);

create table if not exists public.reading_path_items (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  path_id    uuid not null references public.reading_paths(id) on delete cascade,
  book_id    uuid not null references public.books(id) on delete cascade,
  position   integer not null,
  created_at timestamptz not null default now(),
  unique (path_id, book_id)
);

create index if not exists reading_path_items_path_position_idx
  on public.reading_path_items(path_id, position);

alter table public.reading_path_items enable row level security;

create policy "reading_path_items_select_own" on public.reading_path_items
  for select using (auth.uid() = user_id);
create policy "reading_path_items_insert_own" on public.reading_path_items
  for insert with check (auth.uid() = user_id);
create policy "reading_path_items_update_own" on public.reading_path_items
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "reading_path_items_delete_own" on public.reading_path_items
  for delete using (auth.uid() = user_id);
