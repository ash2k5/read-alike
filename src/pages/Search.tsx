
import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { BookGrid } from "@/components/book-grid";
import { GenreSelector } from "@/components/genre-selector";
import { books, genres } from "@/data/mockData";
import { Book } from "@/types";
import { Search as SearchIcon } from "lucide-react";
import { searchBooks, getBooksByGenre } from "@/lib/bookApi";

const Search = () => {
  const [query, setQuery] = useState("");
  const [selectedGenreId, setSelectedGenreId] = useState<string | undefined>(undefined);
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  
  const handleSearch = async () => {
    if (!query && !selectedGenreId) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }
    
    try {
      let results: Book[] = [];
      
      if (query) {
        results = await searchBooks(query);
      } else if (selectedGenreId) {
        const genre = genres.find(g => g.id === selectedGenreId);
        if (genre) {
          results = await getBooksByGenre(genre.name);
        }
      }
      
      setSearchResults(results);
      setHasSearched(true);
    } catch (error) {
      console.error('Error searching books:', error);
      setSearchResults([]);
      setHasSearched(true);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <section className="mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center font-serif">Search Books</h1>
          
          <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-sm mb-8">
            <div className="space-y-4">
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                  Search by title, author, or description
                </label>
                <div className="relative">
                  <input
                    id="search"
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search books..."
                    className="block w-full px-4 py-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-book-purple focus:border-book-purple"
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <SearchIcon className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>
              
              <div>
                <label htmlFor="genre" className="block text-sm font-medium text-gray-700 mb-1">
                  Filter by genre (optional)
                </label>
                <GenreSelector 
                  onSelect={setSelectedGenreId} 
                  selectedGenreId={selectedGenreId} 
                />
              </div>
              
              <button
                onClick={handleSearch}
                className="w-full bg-book-purple hover:bg-book-purple-dark text-white font-medium py-2.5 px-4 rounded-md transition"
              >
                Search
              </button>
            </div>
          </div>
          
          {hasSearched && (
            <div>
              {searchResults.length > 0 ? (
                <BookGrid 
                  books={searchResults} 
                  title={`Search Results (${searchResults.length})`}
                  variant="horizontal"
                />
              ) : (
                <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                  <h3 className="text-xl font-medium text-gray-900 mb-2">No books found</h3>
                  <p className="text-gray-600">
                    Try adjusting your search terms or filters to find what you're looking for.
                  </p>
                </div>
              )}
            </div>
          )}
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

export default Search;
