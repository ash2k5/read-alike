
import { useState, useEffect } from 'react';
import { useUserProfile } from './useUserProfile';
import { useBookList } from './useBookList';
import { getBooksByGenre, getSimilarBooks } from '@/lib/bookApi';
import { Book } from '@/types';
import { books as mockBooks } from '@/data/mockData';

export function useRecommendations() {
  const { profile } = useUserProfile();
  const { bookLists } = useBookList();
  const [recommendations, setRecommendations] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        setLoading(true);
        let recommendedBooks: Book[] = [];
        
        // If user has favorite genres, get recommendations based on those
        if (profile?.favorite_genres && profile.favorite_genres.length > 0) {
          // Get a random favorite genre
          const randomGenre = profile.favorite_genres[
            Math.floor(Math.random() * profile.favorite_genres.length)
          ];
          
          // Get books from this genre
          const genreBooks = await getBooksByGenre(randomGenre);
          if (genreBooks.length > 0) {
            recommendedBooks = [...recommendedBooks, ...genreBooks];
          }
        }
        
        // Get books the user has read
        const readBookIds = bookLists
          .filter(item => item.status === 'completed')
          .map(item => item.book_id);
        
        // If user has read books, get similar books
        if (readBookIds.length > 0) {
          // Get a random read book
          const randomBookId = readBookIds[Math.floor(Math.random() * readBookIds.length)];
          const randomBook = mockBooks.find(book => book.id === randomBookId);
          
          if (randomBook) {
            const similarBooks = await getSimilarBooks(randomBook);
            if (similarBooks.length > 0) {
              recommendedBooks = [...recommendedBooks, ...similarBooks];
            }
          }
        }
        
        // If we couldn't get any recommendations, fall back to mock data
        if (recommendedBooks.length === 0) {
          recommendedBooks = mockBooks.slice(0, 5);
        }
        
        // Remove duplicates and filter out books the user already has in their lists
        const userBookIds = bookLists.map(item => item.book_id);
        const uniqueRecommendations = recommendedBooks
          .filter((book, index, self) => 
            !userBookIds.includes(book.id) && 
            index === self.findIndex(b => b.id === book.id)
          )
          .slice(0, 10); // Limit to 10 recommendations
        
        setRecommendations(uniqueRecommendations);
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch recommendations'));
        // Fallback to mock data
        setRecommendations(mockBooks.slice(0, 5));
      } finally {
        setLoading(false);
      }
    }
    
    fetchRecommendations();
  }, [profile, bookLists]);

  return {
    recommendations,
    loading,
    error
  };
}
