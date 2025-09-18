import { Book } from '@/types';
import { UserBook } from '@/hooks/useUserBooks';

export interface RecommendationScore {
  book: Book;
  score: number;
  reasons: string[];
}

export function generateRecommendations(
  userBooks: UserBook[],
  allBooks: Book[],
  limit: number = 10
): RecommendationScore[] {
  if (userBooks.length === 0) {
    return allBooks.slice(0, limit).map(book => ({
      book,
      score: Math.random() * 0.5 + 0.5,
      reasons: ['Popular choice']
    }));
  }

  const userBookIds = new Set(userBooks.map(ub => ub.book_id));
  const readBooks = userBooks.filter(ub => ub.status === 'read');
  const likedBooks = readBooks.filter(ub => (ub.rating || 0) >= 4);

  const candidateBooks = allBooks.filter(book => !userBookIds.has(book.id));

  const recommendations = candidateBooks.map(book => {
    let score = 0;
    const reasons: string[] = [];

    // Genre-based scoring
    const userGenres = getUserPreferredGenres(likedBooks);
    const genreMatch = book.genre.some(g => userGenres.includes(g));
    if (genreMatch) {
      score += 0.4;
      reasons.push('Similar genres to your favorites');
    }

    // Author-based scoring
    const userAuthors = getUserPreferredAuthors(likedBooks);
    if (userAuthors.includes(book.author)) {
      score += 0.3;
      reasons.push('Author you enjoyed before');
    }

    // Rating-based scoring
    if (book.rating >= 4.0) {
      score += 0.2;
      reasons.push('Highly rated book');
    }

    // Year-based scoring (prefer newer books)
    if (book.year >= 2015) {
      score += 0.1;
      reasons.push('Recent publication');
    }

    return { book, score, reasons };
  });

  return recommendations
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

function getUserPreferredGenres(likedBooks: UserBook[]): string[] {
  const genreCounts: Record<string, number> = {};

  likedBooks.forEach(userBook => {
    // Note: We'd need to store genres in UserBook or fetch from Book
    // For now, return empty array
  });

  return Object.entries(genreCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([genre]) => genre);
}

function getUserPreferredAuthors(likedBooks: UserBook[]): string[] {
  const authorCounts: Record<string, number> = {};

  likedBooks.forEach(userBook => {
    authorCounts[userBook.book_author] = (authorCounts[userBook.book_author] || 0) + 1;
  });

  return Object.entries(authorCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([author]) => author);
}