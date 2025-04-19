
import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { BookGrid } from "@/components/book-grid";
import { GenreSelector } from "@/components/genre-selector";
import { books, genres } from "@/data/mockData";
import { Book, Genre } from "@/types";
import { searchBooks, getBooksByGenre, getMoreBooks, getMoreBooksByGenre } from "@/lib/bookApi";
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
  const [totalBooks, setTotalBooks] = useState(0);
  const booksPerPage = 20;
  const [loadingMore, setLoadingMore] = useState(false);
  
  const fetchBooks = async (page: number = 1) => {
    const startIndex = (page - 1) * booksPerPage;
    setLoading(true);
    
    try {
      if (selectedGenreId) {
        const genre = genres.find(g => g.id === selectedGenreId);
        setSelectedGenre(genre);
        
        if (genre) {
          let apiBooks: Book[] = [];
          
          if (page === 1) {
            apiBooks = await getBooksByGenre(genre.name, 0, booksPerPage);
          } else {
            apiBooks = await getMoreBooksByGenre(genre.name, startIndex, booksPerPage);
          }
          
          if (apiBooks && apiBooks.length > 0) {
            if (page === 1) {
              setFilteredBooks(apiBooks);
            } else {
              setFilteredBooks(prev => [...prev, ...apiBooks]);
            }
            setTotalBooks(Math.max(apiBooks.length + startIndex, totalBooks));
            setTotalPages(Math.ceil((apiBooks.length + startIndex) / booksPerPage));
            setLoading(false);
            return;
          }
        }
        
        const filtered = books.filter(book => 
          book.genre.some(g => g.id === selectedGenreId)
        );
        setFilteredBooks(filtered);
        setTotalBooks(filtered.length);
        setTotalPages(Math.ceil(filtered.length / booksPerPage));
      } else {
        setSelectedGenre(undefined);
        
        let apiBooks: Book[] = [];
        const searchQuery = "subject:fiction&orderBy=relevance";
        
        if (page === 1) {
          apiBooks = await searchBooks(searchQuery, 0, booksPerPage);
        } else {
          apiBooks = await getMoreBooks(searchQuery, startIndex, booksPerPage);
        }
        
        if (apiBooks && apiBooks.length > 0) {
          if (page === 1) {
            setFilteredBooks(apiBooks);
          } else {
            setFilteredBooks(prev => [...prev, ...apiBooks]);
          }
          setTotalBooks(Math.max(apiBooks.length + startIndex, totalBooks));
          setTotalPages(Math.ceil((apiBooks.length + startIndex) / booksPerPage));
          setLoading(false);
          return;
        }
        
        setFilteredBooks(books);
        setTotalBooks(books.length);
        setTotalPages(Math.ceil(books.length / booksPerPage));
      }
    } catch (error) {
      console.error("Error fetching books:", error);
      if (selectedGenreId) {
        const filtered = books.filter(book => 
          book.genre.some(g => g.id === selectedGenreId)
        );
        setFilteredBooks(filtered);
        setTotalBooks(filtered.length);
        setTotalPages(Math.ceil(filtered.length / booksPerPage));
      } else {
        setFilteredBooks(books);
        setTotalBooks(books.length);
        setTotalPages(Math.ceil(books.length / booksPerPage));
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };
  
  useEffect(() => {
    setCurrentPage(1);
    fetchBooks(1);
  }, [selectedGenreId]);
  
  useEffect(() => {
    if (currentPage > 1) {
      setLoadingMore(true);
      fetchBooks(currentPage);
    }
  }, [currentPage]);
  
  const handleLoadMore = () => {
    setCurrentPage(prev => prev + 1);
  };
  
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
              Showing {filteredBooks.length} book{filteredBooks.length !== 1 ? 's' : ''}
              {totalBooks > filteredBooks.length ? ` of ${totalBooks}+ total` : ''}
            </div>
          </div>
          
          {loading && currentPage === 1 ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-book-purple"></div>
            </div>
          ) : (
            <>
              <BookGrid 
                books={filteredBooks} 
                title={selectedGenre ? `${selectedGenre.name} Books` : "All Books"}
                variant="default"
              />
              
              {filteredBooks.length === 0 && !loading && (
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
              
              {/* Load More Button */}
              {filteredBooks.length > 0 && filteredBooks.length < totalBooks && (
                <div className="mt-8 text-center">
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="bg-book-purple hover:bg-book-purple-dark text-white px-5 py-2 rounded-md transition disabled:opacity-70"
                  >
                    {loadingMore ? (
                      <span className="flex items-center">
                        <span className="inline-block h-4 w-4 mr-2 border-t-2 border-b-2 border-white rounded-full animate-spin"></span>
                        Loading...
                      </span>
                    ) : (
                      'Load More Books'
                    )}
                  </button>
                </div>
              )}
              
              {/* Pagination (optional, can be used in addition to Load More) */}
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
