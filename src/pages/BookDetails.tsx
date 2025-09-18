import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Book, ArrowLeft, Star, ExternalLink } from "lucide-react";
import { getEnhancedBookById } from "@/services/enhancedBookApi";
import BookActions from "@/components/book/BookActions";

const BookDetails = () => {
  const { id } = useParams<{ id: string }>();

  const { data: book, isLoading, error } = useQuery({
    queryKey: ["book", id],
    queryFn: () => getEnhancedBookById(id!),
    enabled: !!id,
    staleTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Book not found</h2>
          <Link to="/" className="text-blue-600 hover:underline">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <Book className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">ReadAlike</h1>
            </Link>
            <Link
              to="/search"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              Search Books
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-blue-600 hover:underline mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to home</span>
        </Link>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/3">
              <img
                src={book.cover}
                alt={book.title}
                className="w-full h-96 md:h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder-book.jpg';
                }}
              />
            </div>

            <div className="md:w-2/3 p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {book.title}
              </h1>
              <p className="text-xl text-gray-600 mb-4">{book.author}</p>

              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-1">
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <span className="text-lg font-medium">{book.rating}</span>
                </div>
                {book.year > 0 && (
                  <span className="text-gray-600">{book.year}</span>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {book.genre.map((g, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                  >
                    {g}
                  </span>
                ))}
              </div>

              <div className="mb-6">
                <BookActions book={book} />
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  Description
                </h2>
                <p className="text-gray-700 leading-relaxed">{book.description}</p>
              </div>

              {book.amazonLink && (
                <a
                  href={book.amazonLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-md"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>View on Amazon</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BookDetails;