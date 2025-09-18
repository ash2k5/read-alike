import { useQuery } from '@tanstack/react-query';
import { useUserBooks } from './useUserBooks';
import { enhancedSearchBooks, getTrendingBooks } from '@/services/enhancedBookApi';
import { generateRecommendations, RecommendationScore } from '@/services/recommendations';

export function useRecommendations() {
  const { userBooks } = useUserBooks();

  const { data: recommendations = [], isLoading } = useQuery({
    queryKey: ['recommendations', userBooks.length],
    queryFn: async (): Promise<RecommendationScore[]> => {
      if (userBooks.length === 0) {
        const trendingBooks = await getTrendingBooks(12);
        return generateRecommendations([], trendingBooks, 8);
      }

      const likedBooks = userBooks.filter(ub => (ub.rating || 0) >= 4);

      if (likedBooks.length === 0) {
        const popularBooks = await enhancedSearchBooks('award winning fiction', 24);
        return generateRecommendations(userBooks, popularBooks, 8);
      }

      // Enhanced recommendation logic based on user preferences
      const favoriteAuthors = [...new Set(likedBooks.map(ub => ub.book_author))];
      const searchPromises = [
        ...favoriteAuthors.slice(0, 2).map(author => enhancedSearchBooks(author, 15)),
        enhancedSearchBooks('bestseller fiction 2024', 20),
        enhancedSearchBooks('award winning books', 15),
      ];

      const results = await Promise.all(searchPromises);
      const allCandidates = results.flat();

      return generateRecommendations(userBooks, allCandidates, 8);
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
  });

  return {
    recommendations,
    isLoading,
  };
}