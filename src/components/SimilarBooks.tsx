import { Book } from '@/types';
import { getSimilarBooks } from '@/lib/bookApi';
import { useEffect, useState } from 'react';
import BookCard from './BookCard';

interface SimilarBooksProps {
  book: Book;
}

export default function SimilarBooks({ book }: SimilarBooksProps) {
  const [similarBooks, setSimilarBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSimilarBooks = async () => {
      try {
        setLoading(true);
        const books = await getSimilarBooks(book);
        setSimilarBooks(books);
      } catch (err) {
        setError('Failed to load similar books');
        console.error('Error loading similar books:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSimilarBooks();
  }, [book]);

  if (loading) {
    return (
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Similar Books</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 h-[300px] rounded-lg"></div>
              <div className="mt-2 space-y-2">
                <div className="bg-gray-200 h-4 w-3/4 rounded"></div>
                <div className="bg-gray-200 h-4 w-1/2 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Similar Books</h2>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (similarBooks.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Similar Books</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {similarBooks.map((similarBook) => (
          <BookCard key={similarBook.id} book={similarBook} />
        ))}
      </div>
    </div>
  );
} 