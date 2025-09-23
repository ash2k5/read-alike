import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Book } from '@/types';
import { BookSimilarityService } from '@/lib/api/bookSimilarity';
import { enhancedSearchBooks } from '@/lib/api/enhancedBookApi';

export function useBookSimilarity(targetBook: Book | null, limit: number = 5) {
  // Fetch a broader set of books for similarity comparison
  const { data: allBooks = [], isLoading: booksLoading } = useQuery({
    queryKey: ['books-for-similarity'],
    queryFn: async () => {
      // Get books from multiple popular search terms to build a diverse corpus
      const searchTerms = ['fiction', 'non-fiction', 'mystery', 'romance', 'science'];
      const allResults: Book[] = [];

      for (const term of searchTerms) {
        try {
          const results = await enhancedSearchBooks(term, 20);
          allResults.push(...results);
        } catch (error) {
          console.warn(`Failed to fetch books for term: ${term}`, error);
        }
      }

      // Remove duplicates based on book ID
      const uniqueBooks = allResults.filter((book, index, self) =>
        index === self.findIndex(b => b.id === book.id)
      );

      return uniqueBooks;
    },
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes
  });

  // Create similarity service and find similar books
  const similarBooks = useMemo(() => {
    if (!targetBook || allBooks.length === 0) return [];

    try {
      const similarityService = new BookSimilarityService(allBooks);
      return similarityService.findSimilarBooks(targetBook.id, allBooks, limit);
    } catch (error) {
      console.error('Error calculating book similarities:', error);
      return [];
    }
  }, [targetBook, allBooks, limit]);

  // Get explanation for why books are similar
  const getExplanation = useMemo(() => {
    if (!targetBook || allBooks.length === 0) return () => [];

    const similarityService = new BookSimilarityService(allBooks);
    return (book: Book) => similarityService.getExplanation(targetBook, book);
  }, [targetBook, allBooks]);

  return {
    similarBooks,
    isLoading: booksLoading,
    getExplanation,
    hasData: allBooks.length > 0
  };
}