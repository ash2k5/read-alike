
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
        
        
        if (profile?.favorite_genres && profile.favorite_genres.length > 0) {
          
          const randomGenre = profile.favorite_genres[
            Math.floor(Math.random() * profile.favorite_genres.length)
          ];
          
          
          const genreBooks = await getBooksByGenre(randomGenre);
          if (genreBooks.length > 0) {
            recommendedBooks = [...recommendedBooks, ...genreBooks];
          }
        }
        
        
        const readBookIds = bookLists
          .filter(item => item.status === 'completed')
          .map(item => item.book_id);
        
        
        if (readBookIds.length > 0) {
          
          const randomBookId = readBookIds[Math.floor(Math.random() * readBookIds.length)];
          const randomBook = mockBooks.find(book => book.id === randomBookId);
          
          if (randomBook) {
            const similarBooks = await getSimilarBooks(randomBook);
            if (similarBooks.length > 0) {
              recommendedBooks = [...recommendedBooks, ...similarBooks];
            }
          }
        }
        
        
        if (recommendedBooks.length === 0) {
          recommendedBooks = mockBooks.slice(0, 5);
        }
        
        
        const userBookIds = bookLists.map(item => item.book_id);
        const uniqueRecommendations = recommendedBooks
          .filter((book, index, self) => 
            !userBookIds.includes(book.id) && 
            index === self.findIndex(b => b.id === book.id)
          )
          .slice(0, 10); 
        
        setRecommendations(uniqueRecommendations);
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch recommendations'));
        
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
