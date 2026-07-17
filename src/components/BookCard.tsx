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
  const progressPct =
    book.status === "reading" && book.totalPages && book.totalPages > 0 && book.currentPage != null
      ? Math.min(100, Math.round((book.currentPage / book.totalPages) * 100))
      : null;

  return (
    <div
      onClick={onClick}
      className="flex cursor-pointer flex-col overflow-hidden rounded-xl border border-border bg-surface transition-all hover:-translate-y-0.5 hover:border-border-2 hover:shadow-md"
    >
      <div className="relative aspect-[2/3] w-full bg-surface-2">
        <CoverThumb
          coverUrl={book.coverUrl}
          coverId={book.coverId}
          categoryId={book.categoryId}
          background={bookColor(book.id)}
          size="L"
          fill
          emojiTextClassName="text-4xl"
        />
        {(book.owned || book.star) && (
          <div className="absolute right-1.5 top-1.5 flex flex-col items-end gap-1">
            {book.owned && (
              <span
                className="flex h-5 w-5 items-center justify-center rounded-full bg-black/55 text-[10px] backdrop-blur-sm"
                title="You own a physical copy"
              >
                📦
              </span>
            )}
            {book.star && (
              <span
                className="flex h-5 w-5 items-center justify-center rounded-full bg-black/55 text-[10px]"
                title="Starred"
              >
                ⭐
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-2.5">
        <div className="line-clamp-2 text-[13px] font-medium leading-snug text-text-1">{book.title}</div>
        <div className="truncate text-[11px] text-text-3">{book.author || "—"}</div>
        <span
          className={`mt-auto inline-flex w-fit items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium ${PILL_CLASSES[book.status]}`}
        >
          <span className={`h-[4px] w-[4px] rounded-full ${DOT_CLASSES[book.status]}`} />
          {STATUS_LABELS[book.status]}
        </span>
        {progressPct !== null && (
          <div className="mt-1 h-[3px] overflow-hidden rounded-full bg-surface-3">
            <div className="h-full rounded-full bg-text-1" style={{ width: `${progressPct}%` }} />
          </div>
        )}
      </div>
    </div>
  );
}
