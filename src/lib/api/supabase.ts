import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          email: string;
          name: string;
          avatar_url?: string;
          favorite_genres: string[];
          reading_goals?: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          avatar_url?: string;
          favorite_genres?: string[];
          reading_goals?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          avatar_url?: string;
          favorite_genres?: string[];
          reading_goals?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_books: {
        Row: {
          id: string;
          user_id: string;
          book_id: string;
          book_title: string;
          book_author: string;
          book_cover?: string;
          status: 'want_to_read' | 'reading' | 'read';
          rating?: number;
          review?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          book_id: string;
          book_title: string;
          book_author: string;
          book_cover?: string;
          status: 'want_to_read' | 'reading' | 'read';
          rating?: number;
          review?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          book_id?: string;
          book_title?: string;
          book_author?: string;
          book_cover?: string;
          status?: 'want_to_read' | 'reading' | 'read';
          rating?: number;
          review?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
};