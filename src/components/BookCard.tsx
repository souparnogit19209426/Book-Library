import { CoverThumb } from "@/components/CoverThumb";
import { STATUS_LABELS, bookColor } from "@/lib/constants";
import type { Book } from "@/lib/types";

const PILL_CLASSES: Record<Book["status"], string> = {
  unread: "bg-surface-2 text-text-3",
  reading: "bg-[#f1f3f5] text-[#374151]",
  done: "bg-[#f0f0ef] text-text-1",
  paused: "bg-[#f3f4f6] text-[#6b7280]",
};

const DOT_CLASSES: Record<Book["status"], string> = {
  unread: "bg-status-unread",
  reading: "bg-status-reading",
  done: "bg-status-done",
  paused: "bg-status-paused",
};

export function BookCard({ book, onClick }: { book: Book; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="flex cursor-pointer flex-col gap-2.5 rounded-2xl border border-border bg-surface p-4 transition-all hover:-translate-y-px hover:border-border-2 hover:shadow-md"
    >
      <div className="flex h-[100px] items-center justify-center overflow-hidden rounded-md bg-surface-2">
        <CoverThumb
          coverId={book.coverId}
          categoryId={book.categoryId}
          background={bookColor(book.id)}
          size="M"
        />
      </div>
      <div>
        <div className="text-sm font-medium leading-tight text-text-1">{book.title}</div>
        <div className="mt-0.5 text-xs text-text-3">{book.author || "—"}</div>
      </div>
      <div className="mt-auto flex items-center justify-between">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${PILL_CLASSES[book.status]}`}
        >
          <span className={`h-[5px] w-[5px] rounded-full ${DOT_CLASSES[book.status]}`} />
          {STATUS_LABELS[book.status]}
        </span>
        <div className="flex items-center gap-1">
          {book.owned && (
            <span
              className="inline-flex items-center gap-0.5 rounded-full bg-[#fdf6ec] px-2 py-0.5 text-[10px] font-medium text-[#92400e]"
              title="You own a physical copy"
            >
              📦 Owned
            </span>
          )}
          {book.star && <span className="text-[13px] text-[#d4a843]">⭐</span>}
        </div>
      </div>
    </div>
  );
}
