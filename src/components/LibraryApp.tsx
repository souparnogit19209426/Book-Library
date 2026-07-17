"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  addBookAction,
  addCategoryAction,
  addToReadingPathAction,
  backfillCoversAction,
  createReadingPathAction,
  deleteBookAction,
  deleteCategoryAction,
  deleteReadingPathAction,
  importLibraryAction,
  removeBookCoverAction,
  removeFromReadingPathAction,
  renameReadingPathAction,
  reorderReadingPathAction,
  signOutAction,
  updateBookAction,
  uploadBookCoverAction,
} from "@/app/actions";
import { AddBookModal, type NewBookInput } from "@/components/AddBookModal";
import { AddToPathModal } from "@/components/AddToPathModal";
import { BookCard } from "@/components/BookCard";
import { BookDetailModal } from "@/components/BookDetailModal";
import { CategoryModal } from "@/components/CategoryModal";
import { ManageReadingPathsModal } from "@/components/ManageReadingPathsModal";
import { ProgressSection } from "@/components/ProgressSection";
import { ReadingPath } from "@/components/ReadingPath";
import { Sidebar, type NavFilter } from "@/components/Sidebar";
import { StatusTabs } from "@/components/StatusTabs";
import { TopBar } from "@/components/TopBar";
import { catEmoji } from "@/lib/constants";
import type { Book, BookStatus, Category, LibraryExport, ReadingPath as ReadingPathType, ReadingPathItem } from "@/lib/types";

export function LibraryApp({
  initialBooks,
  initialCategories,
  initialPaths,
  initialPathItems,
  userEmail,
}: {
  initialBooks: Book[];
  initialCategories: Category[];
  initialPaths: ReadingPathType[];
  initialPathItems: ReadingPathItem[];
  userEmail: string;
}) {
  const [books, setBooks] = useState<Book[]>(initialBooks);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [paths, setPaths] = useState<ReadingPathType[]>(initialPaths);
  const [pathItems, setPathItems] = useState<ReadingPathItem[]>(initialPathItems);
  const [navFilter, setNavFilter] = useState<NavFilter>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | BookStatus>("all");
  const [search, setSearch] = useState("");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addToPathModalOpen, setAddToPathModalOpen] = useState(false);
  const [pathsModalOpen, setPathsModalOpen] = useState(false);
  const [detailBook, setDetailBook] = useState<Book | null>(null);
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [backfillingCovers, setBackfillingCovers] = useState(false);
  const backfillStarted = useRef(false);

  useEffect(() => {
    if (backfillStarted.current) return;
    if (!books.some((b) => b.coverId == null)) return;
    backfillStarted.current = true;
    setBackfillingCovers(true);
    backfillCoversAction().then((res) => {
      setBackfillingCovers(false);
      if (!res.ok || res.data.books.length === 0) return;
      const updates = new Map(res.data.books.map((b) => [b.id, b]));
      setBooks((prev) => prev.map((b) => updates.get(b.id) ?? b));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = useMemo(() => {
    const total = books.length;
    const done = books.filter((b) => b.status === "done").length;
    const reading = books.filter((b) => b.status === "reading").length;
    const unread = books.filter((b) => b.status === "unread" || b.status === "paused").length;
    const starred = books.filter((b) => b.star).length;
    const owned = books.filter((b) => b.owned).length;
    return { total, done, reading, unread, starred, owned };
  }, [books]);

  const categoryCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const b of books) {
      if (!b.categoryId) continue;
      map[b.categoryId] = (map[b.categoryId] ?? 0) + 1;
    }
    return map;
  }, [books]);

  const filteredBooks = useMemo(() => {
    const q = search.trim().toLowerCase();
    return books.filter((b) => {
      if (q && !b.title.toLowerCase().includes(q) && !b.author.toLowerCase().includes(q)) return false;
      if (navFilter === "starred" && !b.star) return false;
      if (navFilter === "owned" && !b.owned) return false;
      if (navFilter !== "all" && navFilter !== "starred" && navFilter !== "owned" && b.categoryId !== navFilter)
        return false;
      if (statusFilter !== "all" && b.status !== statusFilter) return false;
      return true;
    });
  }, [books, search, navFilter, statusFilter]);

  const activePathId = navFilter.startsWith("path:") ? navFilter.slice(5) : null;

  const pathItemCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const i of pathItems) map[i.pathId] = (map[i.pathId] ?? 0) + 1;
    return map;
  }, [pathItems]);

  const currentPathItems = useMemo(
    () =>
      activePathId
        ? pathItems.filter((i) => i.pathId === activePathId).sort((a, b) => a.position - b.position)
        : [],
    [pathItems, activePathId],
  );

  const activePathBookIds = useMemo(() => new Set(currentPathItems.map((i) => i.bookId)), [currentPathItems]);

  const { pageTitle, pageSubtitle } = useMemo(() => {
    if (navFilter === "all") return { pageTitle: "All Books", pageSubtitle: `${filteredBooks.length} books in your library` };
    if (navFilter === "starred") return { pageTitle: "Starred Books", pageSubtitle: `${filteredBooks.length} starred books` };
    if (navFilter === "owned") return { pageTitle: "Owned Books", pageSubtitle: `${filteredBooks.length} physical copies you own` };
    if (activePathId) {
      const path = paths.find((p) => p.id === activePathId);
      const count = currentPathItems.length;
      return {
        pageTitle: path ? path.name : "Reading Path",
        pageSubtitle: `${count} book${count === 1 ? "" : "s"} planned, in order`,
      };
    }
    const cat = categories.find((c) => c.id === navFilter);
    return {
      pageTitle: cat ? cat.name : navFilter,
      pageSubtitle: `${filteredBooks.length} books in this category`,
    };
  }, [navFilter, filteredBooks.length, activePathId, currentPathItems.length, paths, categories]);

  const groupedSections = useMemo(() => {
    const grouped: Record<string, Book[]> = {};
    for (const b of filteredBooks) {
      const key = b.categoryId ?? "__other__";
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(b);
    }

    if (navFilter !== "all" && navFilter !== "starred" && navFilter !== "owned") {
      const cat = categories.find((c) => c.id === navFilter) ?? { id: navFilter, name: navFilter };
      return [{ category: cat, items: filteredBooks, hideHeader: true }];
    }

    const sections = categories
      .filter((c) => grouped[c.id]?.length)
      .map((c) => ({ category: c, items: grouped[c.id], hideHeader: false }));

    if (grouped.__other__?.length) {
      sections.push({ category: { id: "other", name: "Other" }, items: grouped.__other__, hideHeader: false });
    }

    return sections;
  }, [filteredBooks, categories, navFilter]);

  async function handleAddBook(input: NewBookInput) {
    const res = await addBookAction(input);
    if (!res.ok) return res.error;
    const newBook = res.data;
    setBooks((prev) => [...prev, newBook]);
  }

  async function handleSaveBook(id: string, patch: Partial<Book>) {
    const res = await updateBookAction(id, patch);
    if (!res.ok) return res.error;
    const updated = res.data;
    setBooks((prev) => prev.map((b) => (b.id === id ? updated : b)));
    setDetailBook(null);
  }

  function handleQuickStatusChange(id: string, status: BookStatus) {
    setBooks((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
    updateBookAction(id, { status });
  }

  async function handleDeleteBook(id: string) {
    const res = await deleteBookAction(id);
    if (!res.ok) return res.error;
    setBooks((prev) => prev.filter((b) => b.id !== id));
    setDetailBook(null);
  }

  async function handleUploadCover(id: string, file: File) {
    const formData = new FormData();
    formData.append("file", file);
    const res = await uploadBookCoverAction(id, formData);
    if (!res.ok) return res.error;
    const updated = res.data;
    setBooks((prev) => prev.map((b) => (b.id === id ? updated : b)));
    setDetailBook((prev) => (prev && prev.id === id ? updated : prev));
  }

  async function handleRemoveCover(id: string) {
    const res = await removeBookCoverAction(id);
    if (!res.ok) return res.error;
    const updated = res.data;
    setBooks((prev) => prev.map((b) => (b.id === id ? updated : b)));
    setDetailBook((prev) => (prev && prev.id === id ? updated : prev));
  }

  async function handleAddToPath(bookId: string) {
    if (!activePathId) return "Open a reading path first.";
    const res = await addToReadingPathAction(activePathId, bookId);
    if (!res.ok) return res.error;
    const newItem = res.data;
    setPathItems((prev) => [...prev, newItem]);
  }

  async function handleRemoveFromPath(itemId: string) {
    setPathItems((prev) => prev.filter((i) => i.id !== itemId));
    await removeFromReadingPathAction(itemId);
  }

  function handleReorderPath(orderedItemIds: string[]) {
    setPathItems((prev) => {
      const positionById = new Map(orderedItemIds.map((id, index) => [id, index]));
      return prev.map((item) =>
        positionById.has(item.id) ? { ...item, position: positionById.get(item.id)! } : item,
      );
    });
    reorderReadingPathAction(orderedItemIds);
  }

  async function handleCreatePath(name: string) {
    const res = await createReadingPathAction(name);
    if (!res.ok) return res.error;
    setPaths((prev) => [...prev, res.data]);
  }

  async function handleRenamePath(id: string, name: string) {
    const res = await renameReadingPathAction(id, name);
    if (!res.ok) return res.error;
    const updated = res.data;
    setPaths((prev) => prev.map((p) => (p.id === id ? updated : p)));
  }

  async function handleDeletePath(id: string) {
    const res = await deleteReadingPathAction(id);
    if (!res.ok) return res.error;
    setPaths((prev) => prev.filter((p) => p.id !== id));
    setPathItems((prev) => prev.filter((i) => i.pathId !== id));
    if (activePathId === id) setNavFilter("all");
  }

  function handleUpdateProgress(bookId: string, currentPage: number | null, totalPages: number | null) {
    setBooks((prev) => prev.map((b) => (b.id === bookId ? { ...b, currentPage, totalPages } : b)));
    updateBookAction(bookId, { currentPage, totalPages });
  }

  async function handleAddCategory(name: string) {
    const res = await addCategoryAction(name);
    if (!res.ok) return res.error;
    const newCategory = res.data;
    setCategories((prev) => [...prev, newCategory]);
  }

  async function handleDeleteCategory(id: string) {
    const res = await deleteCategoryAction(id);
    if (!res.ok) return res.error;
    setCategories((prev) => prev.filter((c) => c.id !== id));
    setBooks((prev) => prev.map((b) => (b.categoryId === id ? { ...b, categoryId: null } : b)));
  }

  function handleExport() {
    const payload: LibraryExport = { books, categories, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bibliotheca_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImportFile(file: File) {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(String(e.target?.result));
        if (!data.books || !Array.isArray(data.books)) throw new Error("Invalid format");
        if (
          !confirm(
            `Import found ${data.books.length} books.\n\nClick OK to REPLACE your current library, or Cancel to abort.`,
          )
        )
          return;
        const res = await importLibraryAction({
          books: data.books,
          categories: Array.isArray(data.categories) ? data.categories : [],
          exportedAt: data.exportedAt ?? new Date().toISOString(),
        });
        if (!res.ok) {
          alert(`Import failed: ${res.error}`);
          return;
        }
        setBooks(res.data.books);
        setCategories(res.data.categories);
        alert("Library imported successfully!");
      } catch {
        alert("Could not read the file. Make sure it is a valid Bibliotheca backup (.json).");
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar
        stats={stats}
        categories={categories}
        categoryCounts={categoryCounts}
        navFilter={navFilter}
        onNavFilter={setNavFilter}
        onOpenCatModal={() => setCatModalOpen(true)}
        userEmail={userEmail}
        onSignOut={() => signOutAction()}
        backfillingCovers={backfillingCovers}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        paths={paths}
        pathItemCounts={pathItemCounts}
        onOpenPathsModal={() => setPathsModalOpen(true)}
      />

      <main className="flex min-w-0 flex-1 flex-col">
        <TopBar
          search={search}
          onSearchChange={setSearch}
          onExport={handleExport}
          onImportFile={handleImportFile}
          onAddBook={() => setAddModalOpen(true)}
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
        />

        <div className="flex-1 p-4 md:p-8">
          <div className="mb-6">
            <div className="font-serif text-2xl tracking-[-0.5px] text-text-1 md:text-[28px]">{pageTitle}</div>
            <div className="mt-1 text-sm text-text-3">{pageSubtitle}</div>
          </div>

          <ProgressSection done={stats.done} reading={stats.reading} total={stats.total} />

          {activePathId ? (
            <ReadingPath
              items={currentPathItems}
              books={books}
              search={search}
              onAddClick={() => setAddToPathModalOpen(true)}
              onRemove={handleRemoveFromPath}
              onReorder={handleReorderPath}
              onOpenBook={setDetailBook}
              onUpdateProgress={handleUpdateProgress}
            />
          ) : (
            <>
              <StatusTabs value={statusFilter} onChange={setStatusFilter} />

              {filteredBooks.length === 0 ? (
                <div className="px-8 py-16 text-center text-text-3">
                  <div className="mb-3 text-4xl">📭</div>
                  <div className="text-base font-medium text-text-2">No books found</div>
                  <div className="mt-1 text-sm">Try adjusting your search or filters</div>
                </div>
              ) : (
                <div className="fade-in">
                  {groupedSections.map(({ category, items, hideHeader }) => (
                    <div key={category.id} className="mb-10">
                      {!hideHeader && (
                        <div className="mb-3.5 flex items-center gap-3">
                          <span className="text-base">{catEmoji(category.id)}</span>
                          <span className="text-[13px] font-semibold uppercase tracking-wide text-text-2">
                            {category.name}
                          </span>
                          <div className="h-px flex-1 bg-border" />
                          <span className="text-xs font-medium text-text-4">{items.length}</span>
                        </div>
                      )}
                      <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3 md:gap-4">
                        {items.map((b) => (
                          <BookCard key={b.id} book={b} onClick={() => setDetailBook(b)} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <AddBookModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        categories={categories}
        onSubmit={handleAddBook}
      />

      <BookDetailModal
        book={detailBook}
        categories={categories}
        onClose={() => setDetailBook(null)}
        onSave={handleSaveBook}
        onDelete={handleDeleteBook}
        onStatusChange={handleQuickStatusChange}
        onUploadCover={handleUploadCover}
        onRemoveCover={handleRemoveCover}
      />

      <CategoryModal
        open={catModalOpen}
        onClose={() => setCatModalOpen(false)}
        categories={categories}
        bookCounts={categoryCounts}
        onAdd={handleAddCategory}
        onDelete={handleDeleteCategory}
      />

      <AddToPathModal
        open={addToPathModalOpen}
        onClose={() => setAddToPathModalOpen(false)}
        books={books}
        pathBookIds={activePathBookIds}
        onAdd={handleAddToPath}
      />

      <ManageReadingPathsModal
        open={pathsModalOpen}
        onClose={() => setPathsModalOpen(false)}
        paths={paths}
        itemCounts={pathItemCounts}
        onCreate={handleCreatePath}
        onRename={handleRenamePath}
        onDelete={handleDeletePath}
      />
    </div>
  );
}
