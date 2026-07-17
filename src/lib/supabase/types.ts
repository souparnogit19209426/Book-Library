export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          user_id: string;
          id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          id: string;
          name: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          id?: string;
          name?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      books: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          author: string;
          category_id: string | null;
          status: "unread" | "reading" | "done" | "paused";
          star: boolean;
          owned: boolean;
          note: string;
          cover_id: number | null;
          cover_url: string | null;
          current_page: number | null;
          total_pages: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          author?: string;
          category_id?: string | null;
          status?: "unread" | "reading" | "done" | "paused";
          star?: boolean;
          owned?: boolean;
          note?: string;
          cover_id?: number | null;
          cover_url?: string | null;
          current_page?: number | null;
          total_pages?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          author?: string;
          category_id?: string | null;
          status?: "unread" | "reading" | "done" | "paused";
          star?: boolean;
          owned?: boolean;
          note?: string;
          cover_id?: number | null;
          cover_url?: string | null;
          current_page?: number | null;
          total_pages?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      reading_paths: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      reading_path_items: {
        Row: {
          id: string;
          user_id: string;
          path_id: string;
          book_id: string;
          position: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          path_id: string;
          book_id: string;
          position: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          path_id?: string;
          book_id?: string;
          position?: number;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
