-- Book cover artwork, resolved via the Open Library Covers API.
-- Stored as the numeric cover id rather than a full URL so we can
-- request different sizes (S/M/L) without re-looking it up.

alter table public.books
  add column if not exists cover_id integer;
