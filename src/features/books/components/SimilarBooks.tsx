import { Book } from '@/types';
import { useBookSimilarity } from '@/features/books/useBookSimilarity';
import BookCard from './BookCard';
import { Loader2, Sparkles } from 'lucide-react';

interface SimilarBooksProps {
  book: Book;
  limit?: number;
}

export function SimilarBooks({ book, limit = 5 }: SimilarBooksProps) {
  const { similarBooks, isLoading, getExplanation, hasData } = useBookSimilarity(book, limit);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">AI-Powered Similar Books</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-600">Analyzing book similarities...</span>
        </div>
      </div>
    );
  }

  if (!hasData || similarBooks.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">AI-Powered Similar Books</h3>
        </div>
        <div className="text-center py-8 text-gray-600">
          <p>No similar books found at the moment.</p>
          <p className="text-sm mt-1">Our AI is still learning about this book!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold">AI-Powered Similar Books</h3>
        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
          ML Powered
        </span>
      </div>

      <p className="text-sm text-gray-600">
        Books similar to "{book.title}" based on content analysis, genres, and themes.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {similarBooks.map(({ book: similarBook, similarity }) => (
          <div key={similarBook.id} className="relative">
            <BookCard book={similarBook} />

            {/* Similarity Score Badge */}
            <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
              {Math.round(similarity * 100)}% match
            </div>

            {/* Explanation Tooltip */}
            <div className="mt-2 p-2 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 font-medium mb-1">Why it's similar:</p>
              <ul className="text-xs text-gray-500 space-y-1">
                {getExplanation(similarBook).map((reason, index) => (
                  <li key={index} className="flex items-start gap-1">
                    <span className="text-green-500 mt-0.5">•</span>
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center">
        <p className="text-xs text-gray-500">
          Powered by TF-IDF vector analysis and cosine similarity algorithm
        </p>
      </div>
    </div>
  );
}