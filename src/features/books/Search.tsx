import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Book, Search as SearchIcon, User, LogOut, X } from "lucide-react";
import { enhancedSearchBooks, getTrendingBooks } from "@/lib/api/enhancedBookApi";
import BookCard from "@/features/books/components/BookCard";
import { useAuth } from "@/features/auth/useAuth";
import { useDebounce } from "@/hooks/useDebounce";

const Search = () => {
  const { user, signOut } = useAuth();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 500);

  // Search books based on debounced query
  const { data: books = [], isLoading, error } = useQuery({
    queryKey: ["books", debouncedQuery],
    queryFn: () => enhancedSearchBooks(debouncedQuery, 24),
    enabled: !!debouncedQuery && debouncedQuery.length >= 2,
    staleTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
  });

  // Get trending books for initial state
  const { data: trendingBooks = [], isLoading: trendingLoading } = useQuery({
    queryKey: ['trending-books'],
    queryFn: () => getTrendingBooks(16),
    staleTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Debounced search handles this automatically
  };

  const clearSearch = () => {
    setQuery("");
  };

  const showResults = debouncedQuery.length >= 2;
  const displayBooks = showResults ? books : trendingBooks;
  const displayLoading = showResults ? isLoading : trendingLoading;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <Book className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">ReadAlike</h1>
            </Link>

            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Home
              </Link>

              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    <User className="h-4 w-4" />
                    <span>My Library</span>
                  </Link>
                  <button
                    onClick={signOut}
                    className="flex items-center space-x-1 text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <Link
                  to="/auth"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto mb-8">
          <form onSubmit={handleSearch} className="relative">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for books, authors, or genres..."
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                autoComplete="off"
              />
              {query && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Search status indicator */}
            {query.length > 0 && query.length < 2 && (
              <p className="text-sm text-gray-500 mt-2">Type at least 2 characters to search</p>
            )}

            {isLoading && debouncedQuery && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-4 mt-1 z-10">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm text-gray-600">Searching...</span>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Results section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {showResults ? `Search Results for "${debouncedQuery}"` : 'Trending Books'}
            </h2>
            {displayBooks.length > 0 && (
              <span className="text-sm text-gray-500">
                {displayBooks.length} books found
              </span>
            )}
          </div>

          {displayLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                  <div className="w-full h-64 bg-gray-200"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600">Error loading books. Please try again.</p>
            </div>
          ) : displayBooks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayBooks.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          ) : showResults ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No books found for "{debouncedQuery}"</p>
              <p className="text-sm text-gray-500 mt-2">Try different keywords or check spelling</p>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
};

export default Search;