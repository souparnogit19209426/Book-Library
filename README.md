# Bibliotheca

A personal book library — track what you're reading, what's done, and what's owned in physical form. Built with Next.js 15 (App Router) + TypeScript + Tailwind CSS, backed by Supabase (Postgres + Auth), deployed on Vercel.

## Stack

- **Frontend**: Next.js 15 App Router, React 19, TypeScript, Tailwind CSS v4
- **Backend**: Supabase Postgres with Row Level Security, Supabase Auth (email/password)
- **Hosting**: Vercel

Every table is scoped per-user (`user_id` + RLS policies), so the app is single-user today but ready for open signup later — see [Going multi-user](#going-multi-user-later) below.

## Status

- [x] Supabase schema + RLS migration applied
- [x] `.env.local` configured with real project credentials
- [x] First user account created; signups turned back off
- [x] Verified end-to-end locally: auth guard, login page, auto-seeded starter library, data persists in Postgres across sessions
- [x] Real book cover art via Open Library, with live lookup on add + background backfill for existing books
- [x] Responsive mobile drawer sidebar
- [x] Pushed to GitHub (`main`, up to date)
- [x] **Deployed to Vercel** — live at `book-library-tau-amber.vercel.app`

## 1. Set up Supabase

1. In your Supabase project, open **SQL Editor** and run each migration in `supabase/migrations/` **in order** (0001 → 0004). They create the `books`/`categories` tables, the cover-art columns and `book-covers` storage bucket, and the `reading_paths`/`reading_path_items` tables — all with RLS policies scoped to `auth.uid()`.
2. Go to **Authentication → Providers** and confirm **Email** is enabled.
3. Go to **Authentication → Settings** and turn **off** "Allow new users to sign up" (recommended while this stays single-user — see below for how you'll create your one account).
4. Go to **Project Settings → API** and copy:
   - **Project URL**
   - **anon / public key**

## 2. Configure environment variables

Copy the example file and fill in your Supabase values:

```bash
cp .env.local.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

These are also the two variables you'll add in Vercel's Project Settings → Environment Variables when deploying.

## 3. Create your account

Since public signup is off, create your one user either:

- **Supabase Studio**: Authentication → Users → **Add user** (set an email + password directly), or
- Temporarily re-enable signups, use the app's "Create account" tab once, then turn signups back off.

## 4. Run locally

```bash
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000), sign in, and the app auto-seeds your library with a starter set of ~90 books across 9 categories the first time it finds an empty account. Delete/edit freely from there — this only happens once, when your `books` table is empty.

## Features

- Email/password auth via Supabase, with session refresh handled in `middleware.ts`
- Full CRUD for books and categories via Next.js Server Actions (`src/app/actions.ts`) — no separate API layer
- Search, status filters (Unread / Reading / Read / Paused), starred and owned-copy views, category browsing
- Real book cover art from the [Open Library Covers API](https://openlibrary.org/dev/docs/api/covers) (key-less) — looked up live while adding a book, with a one-time background backfill for existing books missing one; falls back to a category emoji tile when no match is found
- Manual cover upload/photo for books Open Library has no artwork for (Supabase Storage, RLS-scoped per user)
- **Reading Paths** (plural — create as many named ones as you like, e.g. "Self Development," "Business," "Leadership"): each is an ordered sequence of books to read next, drawn only from your existing library. Drag to reorder within a path (touch-friendly via dnd-kit, not just desktop mouse drag), track current/total page progress with a live progress bar, and jot notes/key takeaways per book — all of which show identically whether you open the book from the library grid or from any path, since it's the same underlying book record. Manage paths (create/rename/delete) from the sidebar's "+" next to Reading Paths
- JSON export/import for backups (replaces your whole library on import, with a confirmation prompt)
- Row Level Security ensures one user's data is never visible to another, even before you open up signups
- Responsive layout: sidebar collapses to a slide-in drawer below the `md` breakpoint for phone/tablet use

## Going multi-user later

The schema and RLS policies are already multi-tenant (every row is scoped to `user_id`). To open the app up:

1. Turn **on** "Allow new users to sign up" in Supabase Authentication settings.
2. That's it — the login page's "Create account" tab already works; each new user gets their own empty library, auto-seeded on first visit just like yours was.

If you'd rather share one library across a few invited people instead of giving everyone their own, that needs a small schema change (a shared `library_id` instead of per-row `user_id`) — ask for that when you're ready.

## Deploy to Vercel

Already deployed — live at `https://book-library-tau-amber.vercel.app`. For reference, or to redeploy elsewhere:

1. Push this repo to GitHub — done, repo is at `souparnogit19209426/Book-Library`.
2. Import the repo in [Vercel](https://vercel.com/new).
3. Add the two environment variables from [step 2](#2-configure-environment-variables) above (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) in Vercel's Project Settings → Environment Variables.
4. Deploy. Vercel will run `next build` automatically on every push to `main`.
5. **Check Deployment Protection** (Project Settings → Deployment Protection) is **off** for Production — it's on by default on team accounts and will block every visitor behind a Vercel login wall, which looks like an outage but isn't one. This app already has its own auth (Supabase), so Vercel-level protection is redundant here.

### Known gotcha: Supabase free-tier pausing

The Supabase project pauses after a period of inactivity (free tier). When paused, its subdomain stops resolving (DNS NXDOMAIN) and the app — local or deployed — will show a blank page or fail to sign in. Fix: restore the project from the Supabase dashboard; no code change needed.

## Project structure

```
src/
  app/
    actions.ts          Server Actions: CRUD, seeding, import, sign-out
    login/page.tsx       Sign-in / sign-up page
    page.tsx              Main dashboard (Server Component: fetches + auto-seeds)
  components/
    LibraryApp.tsx        Client component holding all UI state
    Sidebar.tsx, TopBar.tsx, ProgressSection.tsx, StatusTabs.tsx
    BookCard.tsx, AddBookModal.tsx, BookDetailModal.tsx, CategoryModal.tsx
    ReadingPath.tsx        Ordered/drag-reorderable reading plan for one path (dnd-kit)
    AddToPathModal.tsx     Picker that adds existing library books to a path
    ManageReadingPathsModal.tsx  Create/rename/delete named reading paths
    CoverThumb.tsx         Shared cover-image renderer with emoji fallback
    Modal.tsx              Generic modal shell
  lib/
    constants.ts          Default categories/books seed data, emoji/color helpers
    types.ts               Book/Category/BookStatus/ReadingPathItem types
    openLibrary.ts         Open Library cover lookup + image URL helper
    supabase/               Browser/server/middleware Supabase clients + DB types
supabase/
  migrations/0001_init.sql Schema + RLS policies
  migrations/0002_add_cover_id.sql Adds books.cover_id
  migrations/0003_book_cover_uploads.sql Adds books.cover_url + book-covers storage bucket
  migrations/0004_reading_path.sql Adds reading_paths/reading_path_items + books.current_page/total_pages
```
