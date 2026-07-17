"use client";

import { useRef } from "react";

export function TopBar({
  search,
  onSearchChange,
  onExport,
  onImportFile,
  onAddBook,
  onToggleSidebar,
}: {
  search: string;
  onSearchChange: (v: string) => void;
  onExport: () => void;
  onImportFile: (file: File) => void;
  onAddBook: () => void;
  onToggleSidebar: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-border bg-surface px-4 py-3 md:gap-4 md:px-8 md:py-4">
      <button
        onClick={onToggleSidebar}
        aria-label="Toggle menu"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border text-text-2 transition hover:bg-surface-2 md:hidden"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-[18px] w-[18px]">
          <line x1="4" y1="7" x2="20" y2="7" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="17" x2="20" y2="17" />
        </svg>
      </button>

      <div className="relative min-w-0 max-w-[480px] flex-1">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-4"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search books, authors…"
          className="w-full rounded-full border border-border bg-surface-2 py-2.5 pl-[42px] pr-4 text-sm text-text-1 outline-none transition focus:border-border-2 focus:bg-surface focus:ring-4 focus:ring-text-1/[0.06]"
        />
      </div>

      <div className="ml-auto flex shrink-0 gap-1.5 md:gap-2.5">
        <button
          onClick={onExport}
          title="Export library as JSON backup"
          className="flex items-center gap-1.5 whitespace-nowrap rounded-md border border-border px-2.5 py-2 text-sm font-medium text-text-2 transition hover:bg-surface-2 hover:text-text-1 md:px-4"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-[15px] w-[15px] shrink-0">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          <span className="hidden sm:inline">Export</span>
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          title="Import library from JSON backup"
          className="flex items-center gap-1.5 whitespace-nowrap rounded-md border border-border px-2.5 py-2 text-sm font-medium text-text-2 transition hover:bg-surface-2 hover:text-text-1 md:px-4"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-[15px] w-[15px] shrink-0">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <span className="hidden sm:inline">Import</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onImportFile(file);
            e.target.value = "";
          }}
        />
        <button
          onClick={onAddBook}
          className="flex items-center gap-1.5 whitespace-nowrap rounded-md bg-text-1 px-2.5 py-2 text-sm font-medium text-white transition hover:bg-[#2d2c2a] md:px-4"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-[15px] w-[15px] shrink-0">
            <path d="M12 5v14M5 12h14" />
          </svg>
          <span className="hidden sm:inline">Add Book</span>
        </button>
      </div>
    </div>
  );
}
