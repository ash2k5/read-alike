
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { BookList } from '@/types/supabase';
import { useSupabaseAuth } from './useSupabaseAuth';
import { toast } from '@/components/ui/sonner';

export function useBookList() {
  const { user } = useSupabaseAuth();
  const [bookLists, setBookLists] = useState<BookList[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBookLists() {
      if (!user) {
        setBookLists([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('book_lists')
          .select('*')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error loading book lists:', error);
          return;
        }

        setBookLists(data || []);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }

    loadBookLists();
  }, [user]);

  const addToList = async (bookId: string, status: 'reading' | 'want_to_read' | 'completed') => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const existingEntry = bookLists.find(item => item.book_id === bookId);
      
      if (existingEntry) {
        const { data, error } = await supabase
          .from('book_lists')
          .update({ status })
          .eq('id', existingEntry.id)
          .select()
          .single();

        if (error) {
          toast.error('Failed to update book status');
          return { error };
        }

        setBookLists(current => 
          current.map(item => item.id === data.id ? data : item)
        );
        
        toast.success(`Book moved to "${status.replace('_', ' ')}" list`);
        return { data };
      } else {
        const { data, error } = await supabase
          .from('book_lists')
          .insert({
            user_id: user.id,
            book_id: bookId,
            status
          })
          .select()
          .single();

        if (error) {
          toast.error('Failed to add book to list');
          return { error };
        }

        setBookLists(current => [...current, data]);
        toast.success(`Book added to "${status.replace('_', ' ')}" list`);
        return { data };
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An unexpected error occurred');
      return { error };
    }
  };

  const removeFromList = async (bookId: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const entryToRemove = bookLists.find(item => item.book_id === bookId);
      if (!entryToRemove) return { error: new Error('Book not found in list') };

      const { error } = await supabase
        .from('book_lists')
        .delete()
        .eq('id', entryToRemove.id);

      if (error) {
        toast.error('Failed to remove book from list');
        return { error };
      }

      setBookLists(current => 
        current.filter(item => item.id !== entryToRemove.id)
      );
      
      toast.success('Book removed from list');
      return { success: true };
    } catch (error) {
      console.error('Error:', error);
      toast.error('An unexpected error occurred');
      return { error };
    }
  };

  const getBookStatus = (bookId: string) => {
    const entry = bookLists.find(item => item.book_id === bookId);
    return entry?.status || null;
  };

  return {
    bookLists,
    loading,
    addToList,
    removeFromList,
    getBookStatus
  };
}
