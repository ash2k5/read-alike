import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/services/supabase';
import { useAuth } from './useAuth';
import { Book } from '@/types';

export type BookStatus = 'want_to_read' | 'reading' | 'read';

export interface UserBook {
  id: string;
  user_id: string;
  book_id: string;
  book_title: string;
  book_author: string;
  book_cover?: string;
  status: BookStatus;
  rating?: number;
  review?: string;
  created_at: string;
  updated_at: string;
}

export function useUserBooks() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: userBooks = [], isLoading } = useQuery({
    queryKey: ['userBooks', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_books')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data as UserBook[];
    },
    enabled: !!user,
  });

  const addBookMutation = useMutation({
    mutationFn: async ({ book, status }: { book: Book; status: BookStatus }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_books')
        .insert({
          user_id: user.id,
          book_id: book.id,
          book_title: book.title,
          book_author: book.author,
          book_cover: book.cover,
          status,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userBooks', user?.id] });
    },
  });

  const updateBookMutation = useMutation({
    mutationFn: async ({
      bookId,
      updates
    }: {
      bookId: string;
      updates: Partial<Pick<UserBook, 'status' | 'rating' | 'review'>>
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_books')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .eq('book_id', bookId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userBooks', user?.id] });
    },
  });

  const removeBookMutation = useMutation({
    mutationFn: async (bookId: string) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_books')
        .delete()
        .eq('user_id', user.id)
        .eq('book_id', bookId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userBooks', user?.id] });
    },
  });

  const getBookStatus = (bookId: string): BookStatus | null => {
    const userBook = userBooks.find(ub => ub.book_id === bookId);
    return userBook?.status || null;
  };

  const getBookRating = (bookId: string): number | null => {
    const userBook = userBooks.find(ub => ub.book_id === bookId);
    return userBook?.rating || null;
  };

  const isBookInList = (bookId: string): boolean => {
    return userBooks.some(ub => ub.book_id === bookId);
  };

  const getBooksByStatus = (status: BookStatus): UserBook[] => {
    return userBooks.filter(ub => ub.status === status);
  };

  return {
    userBooks,
    isLoading,
    addBook: addBookMutation.mutate,
    updateBook: updateBookMutation.mutate,
    removeBook: removeBookMutation.mutate,
    getBookStatus,
    getBookRating,
    isBookInList,
    getBooksByStatus,
    isAddingBook: addBookMutation.isPending,
    isUpdatingBook: updateBookMutation.isPending,
    isRemovingBook: removeBookMutation.isPending,
  };
}