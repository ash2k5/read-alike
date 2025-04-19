
import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { BookGrid } from "@/components/book-grid";
import { GenreSelector } from "@/components/genre-selector";
import { books, topReadsThisMonth } from "@/data/mockData";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { searchBooks } from "@/lib/bookApi";
import { useRecommendations } from "@/hooks/useRecommendations";
import { Book } from "@/types";

const Index = () => {
  const [selectedGenreId, setSelectedGenreId] = useState<string | undefined>(undefined);
  const [trendingBooks, setTrendingBooks] = useState<Book[]>(topReadsThisMonth);
  const [isLoadingTrending, setIsLoadingTrending] = useState(false);
  const { recommendations, loading: isLoadingRecommendations } = useRecommendations();
  
  useEffect(() => {
    async function fetchTrendingBooks() {
      setIsLoadingTrending(true);
      try {
        const apiBooks = await searchBooks("subject:fiction&orderBy=newest");
        
        if (apiBooks && apiBooks.length > 0) {
          setTrendingBooks(apiBooks.slice(0, 10));
        }
      } catch (error) {
        console.error("Error fetching trending books:", error);
      } finally {
        setIsLoadingTrending(false);
      }
    }
    
    fetchTrendingBooks();
  }, []);
  
  const filteredTopReads = selectedGenreId 
    ? trendingBooks.filter(book => 
        book.genre.some(g => g.id === selectedGenreId)
      )
    : trendingBooks;
    
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 font-serif">
            Discover Your Next Favorite Book
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Personalized recommendations based on your reading preferences and community favorites.
          </p>
        </section>
        
        {/* Genre Filter */}
        <div className="mb-8 max-w-xs mx-auto">
          <GenreSelector 
            onSelect={setSelectedGenreId} 
            selectedGenreId={selectedGenreId} 
          />
        </div>
        
        {/* Top Reads Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Top Reads This Month</h2>
            <Link 
              to="/browse" 
              className="flex items-center text-book-purple hover:text-book-purple-dark text-sm font-medium"
            >
              View all <ChevronRight size={16} />
            </Link>
          </div>
          
          {isLoadingTrending ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-book-purple"></div>
            </div>
          ) : (
            <BookGrid 
              books={filteredTopReads.length > 0 ? filteredTopReads : []} 
              variant="default" 
            />
          )}
          
          {filteredTopReads.length === 0 && selectedGenreId && (
            <p className="text-center text-gray-500 mt-4">
              No top reads found for this genre.{" "}
              <button 
                onClick={() => setSelectedGenreId(undefined)}
                className="text-book-purple hover:underline"
              >
                Clear filter
              </button>
            </p>
          )}
        </section>
        
        {/* Personalized Recommendations Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recommended For You</h2>
          
          {isLoadingRecommendations ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-book-purple"></div>
            </div>
          ) : (
            <BookGrid books={recommendations.length > 0 ? recommendations : books.slice(0, 5)} variant="default" />
          )}
        </section>
        
        {/* Join Community CTA */}
        <section className="bg-book-purple-dark text-white rounded-2xl p-8 mb-12">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Join Our Reading Community</h2>
            <p className="text-book-purple-light mb-6">
              Create an account to get personalized book recommendations, track your reading, and connect with fellow book lovers.
            </p>
            <Link to="/register" className="bg-white text-book-purple-dark font-medium py-2 px-6 rounded-full hover:bg-gray-100 transition">
              Sign Up Now
            </Link>
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-500 text-sm">
              © 2025 ReadAlike. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
