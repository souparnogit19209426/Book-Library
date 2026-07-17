-- Manual cover uploads, for books Open Library has no artwork for.
-- Stored as a full public URL (distinct from cover_id, the Open
-- Library lookup) so the app can tell "user chose this" from
-- "auto-resolved this" and prefer the former.

alter table public.books
  add column if not exists cover_url text;

insert into storage.buckets (id, name, public)
values ('book-covers', 'book-covers', true)
on conflict (id) do nothing;

-- Uploads live at {user_id}/{book_id}.{ext} — RLS restricts writes to
-- the owning user's own folder; reads are public since the bucket
-- itself is public (this policy just also covers non-public-URL access).
create policy "book_covers_insert_own" on storage.objects
  for insert
  with check (
    bucket_id = 'book-covers'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "book_covers_update_own" on storage.objects
  for update
  using (
    bucket_id = 'book-covers'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "book_covers_delete_own" on storage.objects
  for delete
  using (
    bucket_id = 'book-covers'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "book_covers_public_read" on storage.objects
  for select
  using (bucket_id = 'book-covers');
