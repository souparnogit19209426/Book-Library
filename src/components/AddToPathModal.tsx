"use client";

import { useState } from "react";
import { CoverThumb } from "@/components/CoverThumb";
import { Modal } from "@/components/Modal";
import { bookColor } from "@/lib/constants";
import type { Book } from "@/lib/types";

export function AddToPathModal({
  open,
  onClose,
  books,
  pathBookIds,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  books: Book[];
  pathBookIds: Set<string>;
  onAdd: (bookId: string) => Promise<string | void>;
}) {
  const [search, setSearch] = useState("");
  const [addingId, setAddingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const q = search.trim().toLowerCase();
  const available = books.filter((b) => {
    if (pathBookIds.has(b.id)) return false;
    if (q && !b.title.toLowerCase().includes(q) && !b.author.toLowerCase().includes(q)) return false;
    return true;
  });

  async function handleAdd(book: Book) {
    setAddingId(book.id);
    setError(null);
    const err = await onAdd(book.id);
    setAddingId(null);
    if (err) setError(err);
  }

  return (
    <Modal open={open} onClose={onClose} title="Add to Reading Path" maxWidthClassName="max-w-[460px]">
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search your library…"
        className="mb-4 w-full rounded-md border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-text-1 outline-none transition focus:border-text-1 focus:ring-4 focus:ring-text-1/[0.08]"
      />

      {error && <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="max-h-[360px] space-y-1.5 overflow-y-auto">
        {available.length === 0 && (
          <p className="py-8 text-center text-sm text-text-3">
            {books.length > 0 && books.length === pathBookIds.size
              ? "Every book in your library is already in the path."
              : "No books match your search."}
          </p>
        )}
        {available.map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => handleAdd(b)}
            disabled={addingId === b.id}
            className="flex w-full items-center gap-3 rounded-lg border border-border bg-surface p-2 text-left transition hover:border-border-2 hover:bg-surface-2 disabled:opacity-60"
          >
            <div className="relative h-[52px] w-9 shrink-0 overflow-hidden rounded">
              <CoverThumb
                coverUrl={b.coverUrl}
                coverId={b.coverId}
                categoryId={b.categoryId}
                background={bookColor(b.id)}
                fill
                emojiTextClassName="text-sm"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-text-1">{b.title}</div>
              <div className="truncate text-xs text-text-3">{b.author || "—"}</div>
            </div>
            <span className="shrink-0 text-lg leading-none text-text-3">{addingId === b.id ? "…" : "+"}</span>
          </button>
        ))}
      </div>

      <div className="mt-5 flex justify-end">
        <button
          onClick={onClose}
          className="rounded-md border border-border px-[18px] py-2 text-sm font-medium text-text-2 transition hover:bg-surface-2"
        >
          Done
        </button>
      </div>
    </Modal>
  );
}
