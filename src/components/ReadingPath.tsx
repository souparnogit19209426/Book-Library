"use client";

import { useEffect, useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CoverThumb } from "@/components/CoverThumb";
import { STATUS_LABELS, bookColor } from "@/lib/constants";
import type { Book, ReadingPathItem } from "@/lib/types";

export function ReadingPath({
  items,
  books,
  search,
  onAddClick,
  onRemove,
  onReorder,
  onOpenBook,
  onUpdateProgress,
}: {
  items: ReadingPathItem[];
  books: Book[];
  search: string;
  onAddClick: () => void;
  onRemove: (itemId: string) => void;
  onReorder: (orderedItemIds: string[]) => void;
  onOpenBook: (book: Book) => void;
  onUpdateProgress: (bookId: string, currentPage: number | null, totalPages: number | null) => void;
}) {
  const booksById = new Map(books.map((b) => [b.id, b]));
  const q = search.trim().toLowerCase();

  const pathBooks = items
    .map((item) => ({ item, book: booksById.get(item.bookId) }))
    .filter((x): x is { item: ReadingPathItem; book: Book } => !!x.book)
    .filter(
      ({ book }) =>
        !q || book.title.toLowerCase().includes(q) || book.author.toLowerCase().includes(q),
    );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = pathBooks.findIndex((pb) => pb.item.id === active.id);
    const newIndex = pathBooks.findIndex((pb) => pb.item.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    onReorder(arrayMove(pathBooks, oldIndex, newIndex).map((pb) => pb.item.id));
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-3">
        <p className="max-w-[46ch] text-sm text-text-3">
          Plan the order you want to read your library in. Drag to reorder, track your page
          progress, and jot down what you learned as you go.
        </p>
        <button
          onClick={onAddClick}
          className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md bg-text-1 px-4 py-2 text-sm font-medium text-white transition hover:bg-[#2d2c2a]"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-[15px] w-[15px]">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add to Path
        </button>
      </div>

      {pathBooks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border px-8 py-16 text-center text-text-3">
          <div className="mb-3 text-4xl">🧭</div>
          <div className="text-base font-medium text-text-2">
            {items.length === 0 ? "Your reading path is empty" : "No books match your search"}
          </div>
          {items.length === 0 && (
            <div className="mt-1 text-sm">Add books from your library to start planning your next reads, in order.</div>
          )}
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={pathBooks.map((pb) => pb.item.id)} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-2">
              {pathBooks.map(({ item, book }, index) => (
                <SortableRow
                  key={item.id}
                  item={item}
                  book={book}
                  index={index}
                  onRemove={onRemove}
                  onOpenBook={onOpenBook}
                  onUpdateProgress={onUpdateProgress}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

function SortableRow({
  item,
  book,
  index,
  onRemove,
  onOpenBook,
  onUpdateProgress,
}: {
  item: ReadingPathItem;
  book: Book;
  index: number;
  onRemove: (itemId: string) => void;
  onOpenBook: (book: Book) => void;
  onUpdateProgress: (bookId: string, currentPage: number | null, totalPages: number | null) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  const [currentPage, setCurrentPage] = useState(book.currentPage != null ? String(book.currentPage) : "");
  const [totalPages, setTotalPages] = useState(book.totalPages != null ? String(book.totalPages) : "");

  useEffect(() => {
    setCurrentPage(book.currentPage != null ? String(book.currentPage) : "");
    setTotalPages(book.totalPages != null ? String(book.totalPages) : "");
  }, [book.currentPage, book.totalPages]);

  function commitProgress() {
    const cp = currentPage.trim() === "" ? null : Math.max(0, parseInt(currentPage, 10) || 0);
    const tp = totalPages.trim() === "" ? null : Math.max(0, parseInt(totalPages, 10) || 0);
    if (cp === book.currentPage && tp === book.totalPages) return;
    onUpdateProgress(book.id, cp, tp);
  }

  const pct =
    book.totalPages && book.totalPages > 0 && book.currentPage != null
      ? Math.min(100, Math.round((book.currentPage / book.totalPages) * 100))
      : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 rounded-xl border border-border bg-surface p-2.5 sm:gap-3 sm:p-3"
    >
      <button
        {...attributes}
        {...listeners}
        type="button"
        aria-label="Drag to reorder"
        className="touch-none shrink-0 cursor-grab px-1 text-base text-text-4 active:cursor-grabbing"
      >
        ⠿
      </button>

      <div className="w-5 shrink-0 text-center text-xs font-semibold text-text-4 sm:w-6 sm:text-sm">
        {index + 1}
      </div>

      <div
        onClick={() => onOpenBook(book)}
        className="relative h-16 w-11 shrink-0 cursor-pointer overflow-hidden rounded-md"
      >
        <CoverThumb
          coverUrl={book.coverUrl}
          coverId={book.coverId}
          categoryId={book.categoryId}
          background={bookColor(book.id)}
          fill
          emojiTextClassName="text-lg"
        />
      </div>

      <div className="min-w-0 flex-1 cursor-pointer" onClick={() => onOpenBook(book)}>
        <div className="truncate text-sm font-medium text-text-1">{book.title}</div>
        <div className="truncate text-xs text-text-3">{book.author || "—"}</div>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-[10px] font-medium text-text-4">{STATUS_LABELS[book.status]}</span>
          {pct !== null && (
            <div className="h-[3px] w-16 overflow-hidden rounded-full bg-surface-3">
              <div className="h-full rounded-full bg-text-1" style={{ width: `${pct}%` }} />
            </div>
          )}
        </div>
        {book.note && <div className="mt-1 line-clamp-1 text-xs italic text-text-4">{book.note}</div>}
      </div>

      <div className="hidden shrink-0 items-center gap-1 sm:flex">
        <input
          type="number"
          inputMode="numeric"
          min={0}
          value={currentPage}
          onChange={(e) => setCurrentPage(e.target.value)}
          onBlur={commitProgress}
          placeholder="pg"
          className="w-12 rounded border border-border bg-surface-2 px-1.5 py-1 text-center text-xs text-text-1 outline-none focus:border-text-1"
        />
        <span className="text-xs text-text-4">/</span>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          value={totalPages}
          onChange={(e) => setTotalPages(e.target.value)}
          onBlur={commitProgress}
          placeholder="total"
          className="w-12 rounded border border-border bg-surface-2 px-1.5 py-1 text-center text-xs text-text-1 outline-none focus:border-text-1"
        />
      </div>

      <button
        onClick={() => onRemove(item.id)}
        aria-label="Remove from path"
        className="shrink-0 px-1 text-lg leading-none text-text-4 transition hover:text-red-600"
      >
        ×
      </button>
    </div>
  );
}
