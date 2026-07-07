-- Bibliotheca schema: categories + books, scoped per-user via RLS.
-- Every row carries user_id so the app can move from single-user to
-- open signup later without any schema changes — just an auth setting.

create extension if not exists "pgcrypto";

-- ── categories ──────────────────────────────────────────────────────
create table if not exists public.categories (
  user_id    uuid not null references auth.users(id) on delete cascade,
  id         text not null,
  name       text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, id)
);

alter table public.categories enable row level security;

create policy "categories_select_own" on public.categories
  for select using (auth.uid() = user_id);
create policy "categories_insert_own" on public.categories
  for insert with check (auth.uid() = user_id);
create policy "categories_update_own" on public.categories
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "categories_delete_own" on public.categories
  for delete using (auth.uid() = user_id);

-- ── books ───────────────────────────────────────────────────────────
create table if not exists public.books (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text not null,
  author      text not null default '',
  category_id text,
  status      text not null default 'unread'
              check (status in ('unread', 'reading', 'done', 'paused')),
  star        boolean not null default false,
  owned       boolean not null default false,
  note        text not null default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists books_user_id_idx on public.books(user_id);
create index if not exists books_user_status_idx on public.books(user_id, status);
create index if not exists books_user_category_idx on public.books(user_id, category_id);

alter table public.books enable row level security;

create policy "books_select_own" on public.books
  for select using (auth.uid() = user_id);
create policy "books_insert_own" on public.books
  for insert with check (auth.uid() = user_id);
create policy "books_update_own" on public.books
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "books_delete_own" on public.books
  for delete using (auth.uid() = user_id);

-- keep updated_at current on every edit
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger books_set_updated_at
  before update on public.books
  for each row execute function public.set_updated_at();
