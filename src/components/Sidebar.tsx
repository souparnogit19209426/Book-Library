"use client";

import { catEmoji } from "@/lib/constants";
import type { Category } from "@/lib/types";

export type NavFilter = "all" | "starred" | "owned" | string;

export function Sidebar({
  stats,
  categories,
  categoryCounts,
  navFilter,
  onNavFilter,
  onOpenCatModal,
  userEmail,
  onSignOut,
  backfillingCovers = false,
  open = false,
  onClose,
  pathCount = 0,
}: {
  stats: { total: number; done: number; reading: number; unread: number; starred: number; owned: number };
  categories: Category[];
  categoryCounts: Record<string, number>;
  navFilter: NavFilter;
  onNavFilter: (f: NavFilter) => void;
  onOpenCatModal: () => void;
  userEmail: string;
  onSignOut: () => void;
  backfillingCovers?: boolean;
  open?: boolean;
  onClose?: () => void;
  pathCount?: number;
}) {
  function handleNav(f: NavFilter) {
    onNavFilter(f);
    onClose?.();
  }

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-screen w-[260px] shrink-0 flex-col overflow-y-auto border-r border-border bg-surface transition-transform duration-200 md:sticky md:top-0 md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
      <div className="border-b border-border px-6 pb-5 pt-7">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h1 className="font-serif text-[22px] tracking-[-0.3px] text-text-1">Bibliotheca</h1>
            <p className="mt-0.5 text-xs text-text-3">Personal book library</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-2 text-lg text-text-2 transition hover:bg-surface-3 md:hidden"
          >
            ×
          </button>
        </div>
        {backfillingCovers && (
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-text-4">
            <span className="spinner" />
            Fetching cover images…
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 border-b border-border px-6 py-4">
        <StatChip n={stats.total} label="Total" />
        <StatChip n={stats.done} label="Read" />
        <StatChip n={stats.reading} label="Reading" />
        <StatChip n={stats.unread} label="Unread" />
      </div>

      <nav className="flex-1 px-3 py-4">
        <div className="mb-1.5 mt-3 px-3 text-[10px] font-semibold uppercase tracking-wide text-text-4">
          Browse
        </div>
        <NavItem
          active={navFilter === "all"}
          icon="📚"
          label="All Books"
          count={stats.total}
          onClick={() => handleNav("all")}
        />
        <NavItem
          active={navFilter === "starred"}
          icon="⭐"
          label="Starred"
          count={stats.starred}
          onClick={() => handleNav("starred")}
        />
        <NavItem
          active={navFilter === "owned"}
          icon="📦"
          label="Owned (Physical)"
          count={stats.owned}
          onClick={() => handleNav("owned")}
        />
        <NavItem
          active={navFilter === "reading-path"}
          icon="🧭"
          label="Reading Path"
          count={pathCount}
          onClick={() => handleNav("reading-path")}
        />

        <div className="mb-1.5 mt-4 px-3 text-[10px] font-semibold uppercase tracking-wide text-text-4">
          Categories
        </div>
        {categories.map((c) => (
          <NavItem
            key={c.id}
            active={navFilter === c.id}
            icon={catEmoji(c.id)}
            label={c.name}
            count={categoryCounts[c.id] ?? 0}
            onClick={() => handleNav(c.id)}
          />
        ))}
      </nav>

      <div className="border-t border-border px-6 py-4">
        <button
          onClick={onOpenCatModal}
          className="mb-3 flex w-full items-center justify-center gap-1.5 rounded-md border border-border bg-transparent px-4 py-2 text-[13px] font-medium text-text-2 transition hover:bg-surface-2 hover:text-text-1"
        >
          <span className="text-base leading-none">+</span>
          Manage Categories
        </button>
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-xs text-text-4" title={userEmail}>
            {userEmail}
          </span>
          <button
            onClick={onSignOut}
            className="shrink-0 text-xs font-medium text-text-3 underline underline-offset-2 hover:text-text-1"
          >
            Sign out
          </button>
        </div>
      </div>
      </aside>
    </>
  );
}

function StatChip({ n, label }: { n: number; label: string }) {
  return (
    <div className="rounded-[10px] bg-surface-2 px-3 py-2.5 text-center">
      <span className="block text-[22px] font-semibold leading-none text-text-1">{n}</span>
      <span className="mt-0.5 block text-[10px] uppercase tracking-wide text-text-3">{label}</span>
    </div>
  );
}

function NavItem({
  active,
  icon,
  label,
  count,
  onClick,
}: {
  active: boolean;
  icon: string;
  label: string;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`mb-0.5 flex w-full items-center gap-2.5 rounded-[10px] px-3 py-2 text-left text-sm transition-colors ${
        active ? "bg-text-1 text-white" : "text-text-2 hover:bg-surface-2 hover:text-text-1"
      }`}
    >
      <span className="text-sm leading-none">{icon}</span>
      <span className="flex-1 truncate">{label}</span>
      <span
        className={`rounded-full px-[7px] py-px text-[11px] font-medium ${
          active ? "bg-white/20 text-white" : "bg-surface-3 text-text-3"
        }`}
      >
        {count}
      </span>
    </button>
  );
}
