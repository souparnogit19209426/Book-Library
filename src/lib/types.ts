export type BookStatus = "unread" | "reading" | "done" | "paused";

export interface Category {
  id: string;
  name: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  categoryId: string | null;
  status: BookStatus;
  star: boolean;
  owned: boolean;
  note: string;
  coverId: number | null;
}

export interface LibraryExport {
  books: Book[];
  categories: Category[];
  exportedAt: string;
}
