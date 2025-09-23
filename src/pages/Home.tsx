import { Link } from "react-router-dom";
import { Book, User, LogOut } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getTrendingBooks } from "@/lib/api/enhancedBookApi";
import BookCard from "@/features/books/components/BookCard";
import { useAuth } from "@/features/auth/useAuth";

const Home = () => {
  const { user, signOut } = useAuth();

  const { data: featuredBooks = [], isLoading } = useQuery({
    queryKey: ['featured-books'],
    queryFn: () => getTrendingBooks(12),
    staleTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Book className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">ReadAlike</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/search"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Search Books
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
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Discover Your Next Favorite Book
          </h2>
          <p className="text-xl text-gray-600">
            Find and explore books from our curated collection
          </p>
        </div>

        <section>
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Trending Books</h3>
          {isLoading ? (
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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {featuredBooks.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Home;