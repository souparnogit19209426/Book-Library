"use client";

import { useEffect, useRef, useState } from "react";
import { lookupBookCoverAction } from "@/app/actions";
import { CoverThumb } from "@/components/CoverThumb";
import { Modal } from "@/components/Modal";
import { STATUS_LABELS, STATUSES, bookColor } from "@/lib/constants";
import type { BookStatus, Category } from "@/lib/types";

export interface NewBookInput {
  title: string;
  author: string;
  categoryId: string;
  status: BookStatus;
  star: boolean;
  owned: boolean;
  note: string;
  coverId: number | null;
}

export function AddBookModal({
  open,
  onClose,
  categories,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  onSubmit: (input: NewBookInput) => Promise<string | void>;
}) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [status, setStatus] = useState<BookStatus>("unread");
  const [note, setNote] = useState("");
  const [star, setStar] = useState(false);
  const [owned, setOwned] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [coverId, setCoverId] = useState<number | null>(null);
  const [coverStatus, setCoverStatus] = useState<"idle" | "loading" | "found" | "none">("idle");
  const coverRequestId = useRef(0);

  useEffect(() => {
    if (open) {
      setTitle("");
      setAuthor("");
      setCategoryId(categories[0]?.id ?? "");
      setStatus("unread");
      setNote("");
      setStar(false);
      setOwned(false);
      setError(null);
      setCoverId(null);
      setCoverStatus("idle");
      coverRequestId.current += 1;
    }
  }, [open, categories]);

  useEffect(() => {
    if (!open) return;
    const trimmedTitle = title.trim();
    if (trimmedTitle.length < 3) {
      setCoverStatus("idle");
      setCoverId(null);
      return;
    }
    setCoverStatus("loading");
    const myRequestId = ++coverRequestId.current;
    const handle = setTimeout(async () => {
      const res = await lookupBookCoverAction(trimmedTitle, author.trim());
      if (myRequestId !== coverRequestId.current) return;
      if (res.ok && res.data.coverId != null) {
        setCoverId(res.data.coverId);
        setCoverStatus("found");
      } else {
        setCoverId(null);
        setCoverStatus("none");
      }
    }, 700);
    return () => clearTimeout(handle);
  }, [title, author, open]);

  async function handleSubmit() {
    if (!title.trim()) {
      setError("Please enter a book title.");
      return;
    }
    setSaving(true);
    setError(null);
    const err = await onSubmit({
      title: title.trim(),
      author: author.trim(),
      categoryId,
      status,
      star,
      owned,
      note: note.trim(),
      coverId,
    });
    setSaving(false);
    if (err) {
      setError(err);
      return;
    }
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Add a book">
      <Field label="Book Title *">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. The Lean Startup"
          className={inputClass}
        />
      </Field>
      <Field label="Author">
        <input
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="e.g. Eric Ries"
          className={inputClass}
        />
      </Field>

      {coverStatus !== "idle" && (
        <div className="mb-[18px] flex items-center gap-3 rounded-md border border-border bg-surface-2 px-3.5 py-2.5">
          <CoverThumb
            coverId={coverId}
            categoryId={categoryId}
            background={bookColor(title || "cover")}
            size="S"
            widthClassName="w-9"
            heightClassName="h-[52px]"
            emojiTextClassName="text-base"
          />
          <p className="text-xs text-text-3">
            {coverStatus === "loading" && "Looking up cover…"}
            {coverStatus === "found" && "Cover found — it'll be attached automatically."}
            {coverStatus === "none" && "No cover found — a default icon will be used."}
          </p>
        </div>
      )}

      <Field label="Status">
        <select value={status} onChange={(e) => setStatus(e.target.value as BookStatus)} className={inputClass}>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Notes (optional)">
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Done till Chapter 7"
          className={inputClass}
        />
      </Field>
      <Field label="Category">
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputClass}>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </Field>
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
          onClick={handleSubmit}
          disabled={saving}
          className="rounded-md bg-text-1 px-[18px] py-2 text-sm font-medium text-white transition hover:bg-[#2d2c2a] disabled:opacity-60"
        >
          {saving ? "Adding…" : "Add to Library"}
        </button>
      </div>
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
