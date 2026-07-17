"use client";

import { useEffect, useState } from "react";
import { CoverThumb } from "@/components/CoverThumb";
import { Modal } from "@/components/Modal";
import { STATUS_LABELS, STATUSES, bookColor } from "@/lib/constants";
import type { Book, BookStatus, Category } from "@/lib/types";

const STATUS_BTN_ACTIVE: Record<BookStatus, string> = {
  unread: "bg-surface-3 border-border-2 text-text-1",
  reading: "bg-[#374151] text-white border-[#374151]",
  done: "bg-text-1 text-white border-text-1",
  paused: "bg-[#6b7280] text-white border-[#6b7280]",
};

export function BookDetailModal({
  book,
  categories,
  onClose,
  onSave,
  onDelete,
  onStatusChange,
}: {
  book: Book | null;
  categories: Category[];
  onClose: () => void;
  onSave: (id: string, patch: Partial<Book>) => Promise<string | void>;
  onDelete: (id: string) => Promise<string | void>;
  onStatusChange: (id: string, status: BookStatus) => void;
}) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [star, setStar] = useState(false);
  const [owned, setOwned] = useState(false);
  const [status, setStatus] = useState<BookStatus>("unread");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (book) {
      setTitle(book.title);
      setAuthor(book.author);
      setCategoryId(book.categoryId);
      setNote(book.note);
      setStar(book.star);
      setOwned(book.owned);
      setStatus(book.status);
      setError(null);
    }
  }, [book]);

  if (!book) return null;

  async function handleSave() {
    if (!book) return;
    setSaving(true);
    setError(null);
    const err = await onSave(book.id, {
      title: title.trim() || book.title,
      author: author.trim(),
      categoryId,
      note: note.trim(),
      star,
      owned,
      status,
    });
    setSaving(false);
    if (err) {
      setError(err);
      return;
    }
    onClose();
  }

  async function handleDelete() {
    if (!book) return;
    if (!confirm("Remove this book from your library?")) return;
    setDeleting(true);
    const err = await onDelete(book.id);
    setDeleting(false);
    if (err) setError(err);
  }

  return (
    <Modal open={!!book} onClose={onClose} title="Book Details" maxWidthClassName="max-w-[440px]">
      <div className="mb-5 flex gap-5">
        <div className="shrink-0">
          <CoverThumb
            coverId={book.coverId}
            categoryId={categoryId}
            background={bookColor(book.id)}
            size="L"
            widthClassName="w-20"
            heightClassName="h-28"
            emojiTextClassName="text-3xl"
          />
        </div>
        <div className="flex-1">
          <div className="font-serif text-xl leading-tight text-text-1">{book.title}</div>
          <div className="mt-1 text-sm text-text-3">{book.author || "Unknown author"}</div>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {star && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#fef3c7] px-2.5 py-1 text-[11px] font-medium text-[#92400e]">
                ⭐ Starred
              </span>
            )}
            {owned && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#fdf6ec] px-2.5 py-1 text-[11px] font-medium text-[#92400e]">
                📦 Owned
              </span>
            )}
          </div>
        </div>
      </div>

      <Field label="Title">
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
      </Field>
      <Field label="Author">
        <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} className={inputClass} />
      </Field>
      <Field label="Category">
        <select value={categoryId ?? ""} onChange={(e) => setCategoryId(e.target.value || null)} className={inputClass}>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </Field>

      <div className="mt-4">
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-text-3">Reading Status</label>
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => {
                setStatus(s);
                onStatusChange(book.id, s);
              }}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
                status === s ? STATUS_BTN_ACTIVE[s] : "border-border bg-surface text-text-2 hover:border-border-2"
              }`}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <Field label="Notes">
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Paused at chapter 3"
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Starred">
        <select value={star ? "true" : "false"} onChange={(e) => setStar(e.target.value === "true")} className={inputClass}>
          <option value="false">No</option>
          <option value="true">Yes ⭐</option>
        </select>
      </Field>
      <Field label="Owned (Physical Copy)">
        <select value={owned ? "true" : "false"} onChange={(e) => setOwned(e.target.value === "true")} className={inputClass}>
          <option value="false">No</option>
          <option value="true">Yes 📦</option>
        </select>
      </Field>

      {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="mt-6 flex justify-end gap-2.5">
        <button
          onClick={onClose}
          className="rounded-md border border-border px-[18px] py-2 text-sm font-medium text-text-2 transition hover:bg-surface-2"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-md bg-text-1 px-[18px] py-2 text-sm font-medium text-white transition hover:bg-[#2d2c2a] disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="mt-5 w-full py-2 text-center text-[13px] text-text-4 underline underline-offset-2 transition hover:text-red-600 disabled:opacity-60"
      >
        {deleting ? "Removing…" : "Remove from library"}
      </button>
    </Modal>
  );
}

const inputClass =
  "w-full rounded-md border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-text-1 outline-none transition focus:border-text-1 focus:ring-4 focus:ring-text-1/[0.08]";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-[18px]">
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-3">{label}</label>
      {children}
    </div>
  );
}
