
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { UserReview } from '@/types/supabase';
import { useSupabaseAuth } from './useSupabaseAuth';
import { toast } from '@/components/ui/sonner';

export function useReviews(bookId?: string) {
  const { user } = useSupabaseAuth();
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [userReview, setUserReview] = useState<UserReview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReviews() {
      try {
        setLoading(true);
        let query = supabase
          .from('user_reviews')
          .select('*');
        
        if (bookId) {
          query = query.eq('book_id', bookId);
        }
        
        const { data, error } = await query;

        if (error) {
          console.error('Error loading reviews:', error);
          return;
        }

        setReviews(data || []);
        
        // If user is logged in, find their review
        if (user && bookId) {
          const myReview = data?.find(r => r.user_id === user.id && r.book_id === bookId) || null;
          setUserReview(myReview);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }

    loadReviews();
  }, [bookId, user]);

  const addReview = async (bookId: string, rating: number, reviewText: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      // Check if the user already has a review for this book
      const existingReview = reviews.find(review => 
        review.user_id === user.id && review.book_id === bookId
      );
      
      if (existingReview) {
        // Update the existing review
        const { data, error } = await supabase
          .from('user_reviews')
          .update({ rating, review_text: reviewText })
          .eq('id', existingReview.id)
          .select()
          .single();

        if (error) {
          toast.error('Failed to update review');
          return { error };
        }

        setReviews(current => 
          current.map(review => review.id === data.id ? data : review)
        );
        setUserReview(data);
        
        toast.success('Review updated successfully');
        return { data };
      } else {
        // Create a new review
        const { data, error } = await supabase
          .from('user_reviews')
          .insert({
            user_id: user.id,
            book_id: bookId,
            rating,
            review_text: reviewText
          })
          .select()
          .single();

        if (error) {
          toast.error('Failed to add review');
          return { error };
        }

        setReviews(current => [...current, data]);
        setUserReview(data);
        
        toast.success('Review added successfully');
        return { data };
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An unexpected error occurred');
      return { error };
    }
  };

  const deleteReview = async (reviewId: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { error } = await supabase
        .from('user_reviews')
        .delete()
        .eq('id', reviewId)
        .eq('user_id', user.id); // Ensure the user owns this review

      if (error) {
        toast.error('Failed to delete review');
        return { error };
      }

      setReviews(current => current.filter(review => review.id !== reviewId));
      
      if (userReview?.id === reviewId) {
        setUserReview(null);
      }
      
      toast.success('Review deleted successfully');
      return { success: true };
    } catch (error) {
      console.error('Error:', error);
      toast.error('An unexpected error occurred');
      return { error };
    }
  };

  return {
    reviews,
    userReview,
    loading,
    addReview,
    deleteReview
  };
}
