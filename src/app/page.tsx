import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { seedLibraryIfEmpty } from "@/app/actions";
import { LibraryApp } from "@/components/LibraryApp";
import type { Book, Category } from "@/lib/types";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  await seedLibraryIfEmpty();

  const [{ data: bookRows }, { data: categoryRows }] = await Promise.all([
    supabase.from("books").select().order("created_at", { ascending: true }),
    supabase.from("categories").select().order("created_at", { ascending: true }),
  ]);

  const books: Book[] = (bookRows ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    author: row.author,
    categoryId: row.category_id,
    status: row.status,
    star: row.star,
    owned: row.owned,
    note: row.note,
    coverId: row.cover_id,
    coverUrl: row.cover_url,
  }));

  const categories: Category[] = (categoryRows ?? []).map((row) => ({
    id: row.id,
    name: row.name,
  }));

  return (
    <LibraryApp
      initialBooks={books}
      initialCategories={categories}
      userEmail={user.email ?? ""}
    />
  );
}
