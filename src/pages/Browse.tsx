
import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { BookGrid } from "@/components/book-grid";
import { GenreSelector } from "@/components/genre-selector";
import { books, genres } from "@/data/mockData";
import { Genre } from "@/types";

const Browse = () => {
  const [selectedGenreId, setSelectedGenreId] = useState<string | undefined>(undefined);
  const [filteredBooks, setFilteredBooks] = useState(books);
  const [selectedGenre, setSelectedGenre] = useState<Genre | undefined>(undefined);
  
  useEffect(() => {
    if (selectedGenreId) {
      const genre = genres.find(g => g.id === selectedGenreId);
      setSelectedGenre(genre);
      
      const filtered = books.filter(book => 
        book.genre.some(g => g.id === selectedGenreId)
      );
      setFilteredBooks(filtered);
    } else {
      setSelectedGenre(undefined);
      setFilteredBooks(books);
    }
  }, [selectedGenreId]);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <section className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6 font-serif">Browse Books</h1>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div className="max-w-xs">
              <GenreSelector 
                onSelect={setSelectedGenreId} 
                selectedGenreId={selectedGenreId}
              />
            </div>
            
            <div className="text-sm text-gray-500">
              Showing {filteredBooks.length} of {books.length} books
            </div>
          </div>
          
          <BookGrid 
            books={filteredBooks} 
            title={selectedGenre ? `${selectedGenre.name} Books` : "All Books"}
            variant="default"
          />
          
          {filteredBooks.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No books found in this genre.</p>
              <button 
                onClick={() => setSelectedGenreId(undefined)}
                className="text-book-purple hover:underline"
              >
                Clear filter
              </button>
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

export default Browse;
