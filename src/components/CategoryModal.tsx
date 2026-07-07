"use client";

import { useState } from "react";
import { Modal } from "@/components/Modal";
import { catEmoji } from "@/lib/constants";
import type { Category } from "@/lib/types";

export function CategoryModal({
  open,
  onClose,
  categories,
  bookCounts,
  onAdd,
  onDelete,
}: {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  bookCounts: Record<string, number>;
  onAdd: (name: string) => Promise<string | void>;
  onDelete: (id: string) => Promise<string | void>;
}) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleAdd() {
    const trimmed = name.trim();
    if (!trimmed) return;
    setSaving(true);
    setError(null);
    const err = await onAdd(trimmed);
    setSaving(false);
    if (err) {
      setError(err);
      return;
    }
    setName("");
  }

  async function handleDelete(id: string) {
    const count = bookCounts[id] ?? 0;
    if (count > 0 && !confirm(`This category has ${count} book(s). They will become uncategorized. Continue?`)) return;
    const err = await onDelete(id);
    if (err) setError(err);
  }

  return (
    <Modal open={open} onClose={onClose} title="Manage Categories" maxWidthClassName="max-w-[460px]">
      <div className="mb-4 flex flex-wrap gap-2">
        {categories.map((c) => (
          <div
            key={c.id}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-2 px-3 py-1.5 text-[13px] text-text-2"
          >
            {catEmoji(c.id)} {c.name}
            <button
              onClick={() => handleDelete(c.id)}
              title="Delete"
              className="p-0 text-sm leading-none text-text-4 transition hover:text-red-600"
            >
              ×
            </button>
          </div>
        ))}
        {categories.length === 0 && <p className="text-sm text-text-3">No categories yet.</p>}
      </div>

      <div className="mb-1">
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-3">
          New Category Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAdd();
          }}
          placeholder="e.g. Philosophy"
          className="w-full rounded-md border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-text-1 outline-none transition focus:border-text-1 focus:ring-4 focus:ring-text-1/[0.08]"
        />
      </div>

      {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="mt-6 flex justify-end gap-2.5">
        <button
          onClick={onClose}
          className="rounded-md border border-border px-[18px] py-2 text-sm font-medium text-text-2 transition hover:bg-surface-2"
        >
          Done
        </button>
        <button
          onClick={handleAdd}
          disabled={saving}
          className="rounded-md bg-text-1 px-[18px] py-2 text-sm font-medium text-white transition hover:bg-[#2d2c2a] disabled:opacity-60"
        >
          {saving ? "Adding…" : "Add Category"}
        </button>
      </div>
    </Modal>
  );
}
