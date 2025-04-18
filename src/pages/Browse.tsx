
import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { BookGrid } from "@/components/book-grid";
import { GenreSelector } from "@/components/genre-selector";
import { books, genres } from "@/data/mockData";
import { Book, Genre } from "@/types";
import { searchBooks, getBooksByGenre } from "@/lib/bookApi";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";

const Browse = () => {
  const [selectedGenreId, setSelectedGenreId] = useState<string | undefined>(undefined);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>(books);
  const [selectedGenre, setSelectedGenre] = useState<Genre | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const booksPerPage = 20;
  
  useEffect(() => {
    async function fetchBooks() {
      setLoading(true);
      try {
        if (selectedGenreId) {
          const genre = genres.find(g => g.id === selectedGenreId);
          setSelectedGenre(genre);
          
          // Try to fetch from API first
          if (genre) {
            const apiBooks = await getBooksByGenre(genre.name);
            
            if (apiBooks && apiBooks.length > 0) {
              setFilteredBooks(apiBooks);
              setTotalPages(Math.ceil(apiBooks.length / booksPerPage));
              setLoading(false);
              return;
            }
          }
          
          // Fallback to mock data if API fails
          const filtered = books.filter(book => 
            book.genre.some(g => g.id === selectedGenreId)
          );
          setFilteredBooks(filtered);
          setTotalPages(Math.ceil(filtered.length / booksPerPage));
        } else {
          setSelectedGenre(undefined);
          
          // Try to fetch popular books from API
          const apiBooks = await searchBooks("subject:fiction&orderBy=relevance&maxResults=40");
          
          if (apiBooks && apiBooks.length > 0) {
            setFilteredBooks(apiBooks);
            setTotalPages(Math.ceil(apiBooks.length / booksPerPage));
            setLoading(false);
            return;
          }
          
          // Fallback to mock data
          setFilteredBooks(books);
          setTotalPages(Math.ceil(books.length / booksPerPage));
        }
      } catch (error) {
        console.error("Error fetching books:", error);
        // Fallback to mock data
        if (selectedGenreId) {
          const filtered = books.filter(book => 
            book.genre.some(g => g.id === selectedGenreId)
          );
          setFilteredBooks(filtered);
          setTotalPages(Math.ceil(filtered.length / booksPerPage));
        } else {
          setFilteredBooks(books);
          setTotalPages(Math.ceil(books.length / booksPerPage));
        }
      } finally {
        setLoading(false);
      }
    }
    
    fetchBooks();
    setCurrentPage(1); // Reset to first page when changing genre
  }, [selectedGenreId]);
  
  // Calculate current page slice of books
  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);
  
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
              Showing {currentBooks.length} of {filteredBooks.length} books
            </div>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-book-purple"></div>
            </div>
          ) : (
            <>
              <BookGrid 
                books={currentBooks} 
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
              
              {filteredBooks.length > booksPerPage && (
                <div className="mt-8">
                  <Pagination>
                    <PaginationContent>
                      {currentPage > 1 && (
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                          />
                        </PaginationItem>
                      )}
                      
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        // Show at most 5 page links
                        let pageNum = i + 1;
                        if (totalPages > 5 && currentPage > 3) {
                          pageNum = currentPage - 3 + i;
                          if (pageNum > totalPages) {
                            pageNum = totalPages - (4 - i);
                          }
                        }
                        
                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationLink
                              isActive={currentPage === pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      
                      {currentPage < totalPages && (
                        <PaginationItem>
                          <PaginationNext 
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                          />
                        </PaginationItem>
                      )}
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
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
