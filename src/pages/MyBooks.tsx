
import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { BookGrid } from "@/components/book-grid";
import { currentUser, books } from "@/data/mockData";
import { User, Book } from "@/types";
import { Link, Navigate } from "react-router-dom";
import { BookOpen, Star, List } from "lucide-react";

const MyBooks = () => {
  const [activeTab, setActiveTab] = useState<"saved" | "recommendations">("saved");
  
  // If no current user, redirect to home
  if (!currentUser) {
    return <Navigate to="/" />;
  }
  
  // Get user's saved books
  const userBooks = books.filter(book => 
    currentUser.bookList.includes(book.id)
  );
  
  // Mock recommendations based on user's favorite genres
  const recommendedBooks = books.filter(book => 
    !currentUser.bookList.includes(book.id) && 
    book.genre.some(g => currentUser.favoriteGenres.includes(g.id))
  ).slice(0, 5);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User profile header */}
        <section className="mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-book-purple rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{currentUser.name}</h1>
              <p className="text-gray-600">Book Explorer</p>
            </div>
          </div>
        </section>
        
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("saved")}
              className={`py-4 px-1 inline-flex items-center border-b-2 font-medium text-sm ${
                activeTab === "saved"
                  ? "border-book-purple text-book-purple"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <BookOpen size={18} className="mr-2" />
              My Books
            </button>
            
            <button
              onClick={() => setActiveTab("recommendations")}
              className={`py-4 px-1 inline-flex items-center border-b-2 font-medium text-sm ${
                activeTab === "recommendations"
                  ? "border-book-purple text-book-purple"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Star size={18} className="mr-2" />
              Recommendations
            </button>
          </nav>
        </div>
        
        {/* Content */}
        {activeTab === "saved" && (
          <section>
            {userBooks.length > 0 ? (
              <BookGrid 
                books={userBooks} 
                title="My Books" 
                description="Books you've saved to your reading list"
                variant="horizontal"
              />
            ) : (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                <List size={48} className="mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">Your reading list is empty</h3>
                <p className="text-gray-600 mb-6">Start exploring and add books to your list</p>
                <Link 
                  to="/browse"
                  className="inline-flex bg-book-purple hover:bg-book-purple-dark text-white font-medium px-4 py-2 rounded-lg transition"
                >
                  Browse Books
                </Link>
              </div>
            )}
          </section>
        )}
        
        {activeTab === "recommendations" && (
          <section>
            <BookGrid 
              books={recommendedBooks} 
              title="Recommended For You" 
              description="Based on your reading preferences and favorite genres"
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

export default MyBooks;
