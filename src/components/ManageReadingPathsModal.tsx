"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/Modal";
import type { ReadingPath } from "@/lib/types";

export function ManageReadingPathsModal({
  open,
  onClose,
  paths,
  itemCounts,
  onCreate,
  onRename,
  onDelete,
}: {
  open: boolean;
  onClose: () => void;
  paths: ReadingPath[];
  itemCounts: Record<string, number>;
  onCreate: (name: string) => Promise<string | void>;
  onRename: (id: string, name: string) => Promise<string | void>;
  onDelete: (id: string) => Promise<string | void>;
}) {
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setNewName("");
      setError(null);
    }
  }, [open]);

  async function handleCreate() {
    const name = newName.trim();
    if (!name) return;
    setCreating(true);
    setError(null);
    const err = await onCreate(name);
    setCreating(false);
    if (err) {
      setError(err);
      return;
    }
    setNewName("");
  }

  return (
    <Modal open={open} onClose={onClose} title="Manage Reading Paths" maxWidthClassName="max-w-[460px]">
      <div className="mb-4 space-y-2">
        {paths.length === 0 && <p className="text-sm text-text-3">No reading paths yet.</p>}
        {paths.map((p) => (
          <PathRow
            key={p.id}
            path={p}
            count={itemCounts[p.id] ?? 0}
            onRename={onRename}
            onDelete={onDelete}
            onError={setError}
          />
        ))}
      </div>

      <div className="mb-1">
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-3">
          New Reading Path Name
        </label>
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleCreate();
          }}
          placeholder="e.g. Self Development"
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
          onClick={handleCreate}
          disabled={creating}
          className="rounded-md bg-text-1 px-[18px] py-2 text-sm font-medium text-white transition hover:bg-[#2d2c2a] disabled:opacity-60"
        >
          {creating ? "Adding…" : "Add Path"}
        </button>
      </div>
    </Modal>
  );
}

function PathRow({
  path,
  count,
  onRename,
  onDelete,
  onError,
}: {
  path: ReadingPath;
  count: number;
  onRename: (id: string, name: string) => Promise<string | void>;
  onDelete: (id: string) => Promise<string | void>;
  onError: (msg: string) => void;
}) {
  const [name, setName] = useState(path.name);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => setName(path.name), [path.name]);

  async function commitRename() {
    const trimmed = name.trim();
    if (!trimmed || trimmed === path.name) {
      setName(path.name);
      return;
    }
    setSaving(true);
    const err = await onRename(path.id, trimmed);
    setSaving(false);
    if (err) {
      onError(err);
      setName(path.name);
    }
  }

  async function handleDelete() {
    if (count > 0 && !confirm(`"${path.name}" has ${count} book(s) planned. Delete this reading path anyway?`))
      return;
    setDeleting(true);
    const err = await onDelete(path.id);
    setDeleting(false);
    if (err) onError(err);
  }

  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={commitRename}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
        }}
        disabled={saving || deleting}
        className="min-w-0 flex-1 bg-transparent text-sm text-text-1 outline-none disabled:opacity-60"
      />
      <span className="shrink-0 text-xs text-text-4">{count}</span>
      <button
        onClick={handleDelete}
        disabled={deleting}
        title="Delete reading path"
        className="shrink-0 text-sm leading-none text-text-4 transition hover:text-red-600 disabled:opacity-60"
      >
        ×
      </button>
    </div>
  );
}
