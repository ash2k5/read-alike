
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/navbar";
import { Rating } from "@/components/ui/rating";
import { BookGrid } from "@/components/book-grid";
import { Book } from "@/types";
import { books } from "@/data/mockData";
import { ArrowLeft, Heart, Share2 } from "lucide-react";
import { getBookById, getSimilarBooks } from "@/lib/bookApi";
import { BookStoreLinks } from "@/components/book/book-store-links";
import { toast } from "@/components/ui/sonner";

const BookDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [similarBooks, setSimilarBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchBookDetails() {
      setLoading(true);
      
      try {
        // Try to fetch from Google Books API first
        if (id) {
          const apiBook = await getBookById(id);
          
          if (apiBook) {
            setBook(apiBook);
            
            // Get similar books
            const similar = await getSimilarBooks(apiBook);
            setSimilarBooks(similar);
            setLoading(false);
            return;
          }
        }
        
        // Fallback to mock data if API fetch fails
        const foundBook = books.find(b => b.id === id);
        setBook(foundBook || null);
        
        // Get similar books from mock data
        if (foundBook) {
          const genreIds = foundBook.genre.map(g => g.id);
          const similar = books
            .filter(b => 
              b.id !== foundBook.id && 
              b.genre.some(g => genreIds.includes(g.id))
            )
            .slice(0, 5);
          setSimilarBooks(similar);
        }
      } catch (error) {
        console.error("Error fetching book details:", error);
        toast.error("Failed to load book details");
        
        // Fallback to mock data
        const foundBook = books.find(b => b.id === id);
        setBook(foundBook || null);
      } finally {
        setLoading(false);
      }
    }
    
    fetchBookDetails();
  }, [id]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-book-purple"></div>
          </div>
        </main>
      </div>
    );
  }
  
  if (!book) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Book Not Found</h1>
            <p className="text-gray-600 mb-8">The book you're looking for doesn't exist or has been removed.</p>
            <Link to="/browse" className="text-book-purple hover:underline">
              Browse all books
            </Link>
          </div>
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <div className="mb-6">
          <button 
            onClick={() => navigate(-1)} 
            className="inline-flex items-center text-gray-600 hover:text-book-purple"
          >
            <ArrowLeft size={16} className="mr-1" />
            <span>Back</span>
          </button>
        </div>
        
        {/* Book details */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-12">
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Book cover */}
              <div className="flex-shrink-0">
                <img 
                  src={book.cover} 
                  alt={book.title} 
                  className="w-48 h-72 object-cover rounded-lg shadow-md mx-auto md:mx-0" 
                />
                
                <div className="mt-4 flex justify-center md:justify-start space-x-2">
                  <button 
                    onClick={() => setIsFavorite(!isFavorite)}
                    className={`flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                      isFavorite 
                        ? "bg-red-50 text-red-600" 
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <Heart 
                      size={16} 
                      className={`mr-1.5 ${isFavorite ? "fill-red-500" : ""}`} 
                    />
                    {isFavorite ? "Saved" : "Save"}
                  </button>
                  
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      toast.success('Link copied to clipboard');
                    }}
                    className="bg-gray-100 text-gray-700 hover:bg-gray-200 p-2 rounded-full"
                  >
                    <Share2 size={16} />
                  </button>
                </div>
              </div>
              
              {/* Book info */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2 font-serif">{book.title}</h1>
                <p className="text-xl text-gray-700 mb-4">by {book.author}</p>
                
                <div className="flex items-center mb-6">
                  <Rating value={book.rating} showValue size="lg" />
                  <span className="ml-2 text-gray-500 text-sm">({book.reviews?.length || 0} reviews)</span>
                </div>
                
                <div className="mb-6">
                  <h2 className="text-gray-700 font-medium mb-2">About this book</h2>
                  <p className="text-gray-600">{book.description}</p>
                </div>
                
                <div className="mb-6">
                  <h2 className="text-gray-700 font-medium mb-2">Genres</h2>
                  <div className="flex flex-wrap gap-2">
                    {book.genre.map(genre => (
                      <Link 
                        key={genre.id}
                        to={`/browse?genre=${genre.id}`}
                        className="bg-book-softPurple text-book-purple-dark px-3 py-1 rounded-full text-sm hover:bg-book-purple/20"
                      >
                        {genre.name}
                      </Link>
                    ))}
                  </div>
                </div>
                
                {/* Store links - using our new component */}
                <BookStoreLinks book={book} />
              </div>
            </div>
          </div>
        </div>
        
        {/* Reviews section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Reviews</h2>
          
          {book.reviews && book.reviews.length > 0 ? (
            <div className="space-y-6">
              {book.reviews.map(review => (
                <div key={review.id} className="bg-white p-6 rounded-xl shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-book-purple-light rounded-full flex items-center justify-center text-book-purple-dark font-bold">
                        {review.userName.charAt(0)}
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-gray-900">{review.userName}</p>
                        <p className="text-sm text-gray-500">{review.date}</p>
                      </div>
                    </div>
                    <Rating value={review.rating} />
                  </div>
                  <p className="text-gray-700">{review.text}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl">
              <p className="text-gray-500">No reviews yet for this book.</p>
            </div>
          )}
        </section>
        
        {/* Similar books section */}
        {similarBooks.length > 0 && (
          <section className="mb-12">
            <BookGrid 
              books={similarBooks} 
              title="Similar Books You Might Enjoy" 
              description="Based on this book's genre and author"
              variant="default"
            />
          </section>
        )}
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

export default BookDetails;
