"use server";

import { createClient } from "@/lib/supabase/server";
import { DEFAULT_CATEGORIES, DEFAULT_BOOKS } from "@/lib/constants";
import { searchCoverId } from "@/lib/openLibrary";
import type { Book, BookStatus, Category, LibraryExport, ReadingPathItem } from "@/lib/types";
import { redirect } from "next/navigation";

export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

function ok<T>(data: T): ActionResult<T> {
  return { ok: true, data };
}

function fail<T>(err: unknown, fallback: string): ActionResult<T> {
  return { ok: false, error: err instanceof Error ? err.message : fallback };
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return { supabase, userId: user.id };
}

function rowToBook(row: {
  id: string;
  title: string;
  author: string;
  category_id: string | null;
  status: string;
  star: boolean;
  owned: boolean;
  note: string;
  cover_id: number | null;
  cover_url: string | null;
  current_page: number | null;
  total_pages: number | null;
}): Book {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    categoryId: row.category_id,
    status: row.status as BookStatus,
    star: row.star,
    owned: row.owned,
    note: row.note,
    coverId: row.cover_id,
    coverUrl: row.cover_url,
    currentPage: row.current_page,
    totalPages: row.total_pages,
  };
}

const MAX_COVER_BYTES = 8 * 1024 * 1024;
const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/heic": "heic",
  "image/heif": "heif",
};

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function seedLibraryIfEmpty(): Promise<ActionResult<{ seeded: boolean }>> {
  try {
    const { supabase, userId } = await requireUser();

    const { count, error: countError } = await supabase
      .from("books")
      .select("id", { count: "exact", head: true });
    if (countError) throw countError;

    if (count && count > 0) return ok({ seeded: false });

    const { error: catError } = await supabase.from("categories").insert(
      DEFAULT_CATEGORIES.map((c) => ({ user_id: userId, id: c.id, name: c.name })),
    );
    if (catError) throw catError;

    const { error: bookError } = await supabase.from("books").insert(
      DEFAULT_BOOKS.map((b) => ({
        user_id: userId,
        title: b.title,
        author: b.author,
        category_id: b.cat,
        status: b.status,
        star: b.star,
        owned: b.owned ?? false,
        note: b.note ?? "",
      })),
    );
    if (bookError) throw bookError;

    return ok({ seeded: true });
  } catch (err) {
    return fail(err, "Failed to seed library");
  }
}

export async function addBookAction(input: {
  title: string;
  author: string;
  categoryId: string;
  status: BookStatus;
  star: boolean;
  owned: boolean;
  note: string;
  coverId?: number | null;
}): Promise<ActionResult<Book>> {
  try {
    const { supabase, userId } = await requireUser();
    const { data, error } = await supabase
      .from("books")
      .insert({
        user_id: userId,
        title: input.title,
        author: input.author,
        category_id: input.categoryId,
        status: input.status,
        star: input.star,
        owned: input.owned,
        note: input.note,
        cover_id: input.coverId ?? null,
      })
      .select()
      .single();
    if (error) throw error;
    return ok(rowToBook(data));
  } catch (err) {
    return fail(err, "Failed to add book");
  }
}

export async function lookupBookCoverAction(
  title: string,
  author: string,
): Promise<ActionResult<{ coverId: number | null }>> {
  try {
    await requireUser();
    const coverId = await searchCoverId(title, author);
    return ok({ coverId });
  } catch (err) {
    return fail(err, "Failed to look up cover");
  }
}

export async function backfillCoversAction(): Promise<ActionResult<{ books: Book[] }>> {
  try {
    const { supabase, userId } = await requireUser();

    const { data: missing, error } = await supabase
      .from("books")
      .select()
      .eq("user_id", userId)
      .is("cover_id", null);
    if (error) throw error;
    if (!missing || missing.length === 0) return ok({ books: [] });

    const BATCH_SIZE = 5;
    const updated: Book[] = [];

    for (let i = 0; i < missing.length; i += BATCH_SIZE) {
      const batch = missing.slice(i, i + BATCH_SIZE);
      const results = await Promise.all(
        batch.map(async (row) => {
          const coverId = await searchCoverId(row.title, row.author);
          if (coverId == null) return null;
          const { data, error: updateError } = await supabase
            .from("books")
            .update({ cover_id: coverId })
            .eq("id", row.id)
            .eq("user_id", userId)
            .select()
            .single();
          if (updateError || !data) return null;
          return rowToBook(data);
        }),
      );
      updated.push(...results.filter((b): b is Book => b !== null));
    }

    return ok({ books: updated });
  } catch (err) {
    return fail(err, "Failed to fetch cover images");
  }
}

export async function updateBookAction(
  id: string,
  patch: Partial<{
    title: string;
    author: string;
    categoryId: string | null;
    status: BookStatus;
    star: boolean;
    owned: boolean;
    note: string;
    currentPage: number | null;
    totalPages: number | null;
  }>,
): Promise<ActionResult<Book>> {
  try {
    const { supabase, userId } = await requireUser();
    const { data, error } = await supabase
      .from("books")
      .update({
        ...(patch.title !== undefined ? { title: patch.title } : {}),
        ...(patch.author !== undefined ? { author: patch.author } : {}),
        ...(patch.categoryId !== undefined ? { category_id: patch.categoryId } : {}),
        ...(patch.status !== undefined ? { status: patch.status } : {}),
        ...(patch.star !== undefined ? { star: patch.star } : {}),
        ...(patch.owned !== undefined ? { owned: patch.owned } : {}),
        ...(patch.note !== undefined ? { note: patch.note } : {}),
        ...(patch.currentPage !== undefined ? { current_page: patch.currentPage } : {}),
        ...(patch.totalPages !== undefined ? { total_pages: patch.totalPages } : {}),
      })
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();
    if (error) throw error;
    return ok(rowToBook(data));
  } catch (err) {
    return fail(err, "Failed to update book");
  }
}

export async function ensureReadingPathAction(): Promise<ActionResult<{ pathId: string; items: ReadingPathItem[] }>> {
  try {
    const { supabase, userId } = await requireUser();

    const { data: existing, error: selectError } = await supabase
      .from("reading_paths")
      .select("id")
      .eq("user_id", userId)
      .limit(1)
      .maybeSingle();
    if (selectError) throw selectError;

    let pathId = existing?.id;
    if (!pathId) {
      const { data: created, error: insertError } = await supabase
        .from("reading_paths")
        .insert({ user_id: userId, name: "My Reading Path" })
        .select("id")
        .single();
      if (insertError) throw insertError;
      pathId = created.id;
    }

    const { data: items, error: itemsError } = await supabase
      .from("reading_path_items")
      .select("id, book_id, position")
      .eq("user_id", userId)
      .eq("path_id", pathId)
      .order("position", { ascending: true });
    if (itemsError) throw itemsError;

    return ok({
      pathId,
      items: (items ?? []).map((i) => ({ id: i.id, bookId: i.book_id, position: i.position })),
    });
  } catch (err) {
    return fail(err, "Failed to load reading path");
  }
}

export async function addToReadingPathAction(
  pathId: string,
  bookId: string,
): Promise<ActionResult<ReadingPathItem>> {
  try {
    const { supabase, userId } = await requireUser();

    const { data: maxRow } = await supabase
      .from("reading_path_items")
      .select("position")
      .eq("user_id", userId)
      .eq("path_id", pathId)
      .order("position", { ascending: false })
      .limit(1)
      .maybeSingle();
    const nextPosition = (maxRow?.position ?? -1) + 1;

    const { data, error } = await supabase
      .from("reading_path_items")
      .insert({ user_id: userId, path_id: pathId, book_id: bookId, position: nextPosition })
      .select("id, book_id, position")
      .single();
    if (error) throw error;

    return ok({ id: data.id, bookId: data.book_id, position: data.position });
  } catch (err) {
    return fail(err, "Failed to add book to reading path");
  }
}

export async function removeFromReadingPathAction(itemId: string): Promise<ActionResult<{ id: string }>> {
  try {
    const { supabase, userId } = await requireUser();
    const { error } = await supabase
      .from("reading_path_items")
      .delete()
      .eq("id", itemId)
      .eq("user_id", userId);
    if (error) throw error;
    return ok({ id: itemId });
  } catch (err) {
    return fail(err, "Failed to remove book from reading path");
  }
}

export async function reorderReadingPathAction(
  orderedItemIds: string[],
): Promise<ActionResult<{ items: ReadingPathItem[] }>> {
  try {
    const { supabase, userId } = await requireUser();

    const results = await Promise.all(
      orderedItemIds.map((itemId, index) =>
        supabase
          .from("reading_path_items")
          .update({ position: index })
          .eq("id", itemId)
          .eq("user_id", userId)
          .select("id, book_id, position")
          .single(),
      ),
    );
    const failed = results.find((r) => r.error);
    if (failed?.error) throw failed.error;

    const items = results
      .map((r) => r.data)
      .filter((d): d is { id: string; book_id: string; position: number } => !!d)
      .sort((a, b) => a.position - b.position)
      .map((d) => ({ id: d.id, bookId: d.book_id, position: d.position }));

    return ok({ items });
  } catch (err) {
    return fail(err, "Failed to reorder reading path");
  }
}

export async function uploadBookCoverAction(
  bookId: string,
  formData: FormData,
): Promise<ActionResult<Book>> {
  try {
    const { supabase, userId } = await requireUser();

    const file = formData.get("file");
    if (!(file instanceof File)) throw new Error("No file provided");
    if (!file.type.startsWith("image/")) throw new Error("Please choose an image file");
    if (file.size > MAX_COVER_BYTES) throw new Error("Image is too large (max 8MB)");

    const ext = EXT_BY_MIME[file.type] ?? file.name.split(".").pop() ?? "jpg";
    const path = `${userId}/${bookId}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("book-covers")
      .upload(path, file, { contentType: file.type, upsert: true });
    if (uploadError) throw uploadError;

    const { data: pub } = supabase.storage.from("book-covers").getPublicUrl(path);
    const coverUrl = `${pub.publicUrl}?v=${Date.now()}`;

    const { data, error } = await supabase
      .from("books")
      .update({ cover_url: coverUrl })
      .eq("id", bookId)
      .eq("user_id", userId)
      .select()
      .single();
    if (error) throw error;

    return ok(rowToBook(data));
  } catch (err) {
    return fail(err, "Failed to upload cover");
  }
}

export async function removeBookCoverAction(bookId: string): Promise<ActionResult<Book>> {
  try {
    const { supabase, userId } = await requireUser();
    const { data, error } = await supabase
      .from("books")
      .update({ cover_url: null })
      .eq("id", bookId)
      .eq("user_id", userId)
      .select()
      .single();
    if (error) throw error;
    return ok(rowToBook(data));
  } catch (err) {
    return fail(err, "Failed to remove cover");
  }
}

export async function deleteBookAction(id: string): Promise<ActionResult<{ id: string }>> {
  try {
    const { supabase, userId } = await requireUser();
    const { error } = await supabase.from("books").delete().eq("id", id).eq("user_id", userId);
    if (error) throw error;
    return ok({ id });
  } catch (err) {
    return fail(err, "Failed to delete book");
  }
}

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "") || "category";
}

export async function addCategoryAction(name: string): Promise<ActionResult<Category>> {
  try {
    const { supabase, userId } = await requireUser();
    const baseId = slugify(name);

    const { data: existing } = await supabase
      .from("categories")
      .select("id")
      .eq("user_id", userId);
    const existingIds = new Set((existing ?? []).map((c) => c.id));

    let id = baseId;
    let n = 2;
    while (existingIds.has(id)) {
      id = `${baseId}_${n}`;
      n += 1;
    }

    const { data, error } = await supabase
      .from("categories")
      .insert({ user_id: userId, id, name })
      .select()
      .single();
    if (error) throw error;
    return ok({ id: data.id, name: data.name });
  } catch (err) {
    return fail(err, "Failed to add category");
  }
}

export async function deleteCategoryAction(id: string): Promise<ActionResult<{ id: string }>> {
  try {
    const { supabase, userId } = await requireUser();

    const { error: updateError } = await supabase
      .from("books")
      .update({ category_id: null })
      .eq("user_id", userId)
      .eq("category_id", id);
    if (updateError) throw updateError;

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("user_id", userId)
      .eq("id", id);
    if (error) throw error;

    return ok({ id });
  } catch (err) {
    return fail(err, "Failed to delete category");
  }
}

export async function importLibraryAction(
  payload: LibraryExport,
): Promise<ActionResult<{ books: Book[]; categories: Category[] }>> {
  try {
    const { supabase, userId } = await requireUser();

    const { error: delBooksError } = await supabase.from("books").delete().eq("user_id", userId);
    if (delBooksError) throw delBooksError;
    const { error: delCatsError } = await supabase.from("categories").delete().eq("user_id", userId);
    if (delCatsError) throw delCatsError;

    if (payload.categories.length) {
      const { error } = await supabase.from("categories").insert(
        payload.categories.map((c) => ({ user_id: userId, id: c.id, name: c.name })),
      );
      if (error) throw error;
    }

    if (payload.books.length) {
      const { error } = await supabase.from("books").insert(
        payload.books.map((b) => ({
          user_id: userId,
          title: b.title,
          author: b.author,
          category_id: b.categoryId,
          status: b.status,
          star: b.star,
          owned: b.owned,
          note: b.note,
        })),
      );
      if (error) throw error;
    }

    const [{ data: books, error: booksErr }, { data: categories, error: catsErr }] =
      await Promise.all([
        supabase.from("books").select().eq("user_id", userId),
        supabase.from("categories").select().eq("user_id", userId),
      ]);
    if (booksErr) throw booksErr;
    if (catsErr) throw catsErr;

    return ok({
      books: (books ?? []).map(rowToBook),
      categories: (categories ?? []).map((c) => ({ id: c.id, name: c.name })),
    });
  } catch (err) {
    return fail(err, "Failed to import library");
  }
}
