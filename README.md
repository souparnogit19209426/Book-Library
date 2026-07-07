# Bibliotheca

A personal book library — track what you're reading, what's done, and what's owned in physical form. Built with Next.js 15 (App Router) + TypeScript + Tailwind CSS, backed by Supabase (Postgres + Auth), deployed on Vercel.

## Stack

- **Frontend**: Next.js 15 App Router, React 19, TypeScript, Tailwind CSS v4
- **Backend**: Supabase Postgres with Row Level Security, Supabase Auth (email/password)
- **Hosting**: Vercel

Every table is scoped per-user (`user_id` + RLS policies), so the app is single-user today but ready for open signup later — see [Going multi-user](#going-multi-user-later) below.

## 1. Set up Supabase

1. In your Supabase project, open **SQL Editor** and run the migration in [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql). This creates the `books` and `categories` tables with RLS policies scoped to `auth.uid()`.
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
- JSON export/import for backups (replaces your whole library on import, with a confirmation prompt)
- Row Level Security ensures one user's data is never visible to another, even before you open up signups

## Going multi-user later

The schema and RLS policies are already multi-tenant (every row is scoped to `user_id`). To open the app up:

1. Turn **on** "Allow new users to sign up" in Supabase Authentication settings.
2. That's it — the login page's "Create account" tab already works; each new user gets their own empty library, auto-seeded on first visit just like yours was.

If you'd rather share one library across a few invited people instead of giving everyone their own, that needs a small schema change (a shared `library_id` instead of per-row `user_id`) — ask for that when you're ready.

## Deploy to Vercel

1. Push this repo to GitHub (already set up).
2. Import the repo in [Vercel](https://vercel.com/new).
3. Add the two environment variables from step 2 above.
4. Deploy. Vercel will run `next build` automatically on every push to your default branch.

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
    Modal.tsx              Generic modal shell
  lib/
    constants.ts          Default categories/books seed data, emoji/color helpers
    types.ts               Book/Category/BookStatus types
    supabase/               Browser/server/middleware Supabase clients + DB types
supabase/
  migrations/0001_init.sql Schema + RLS policies
```
