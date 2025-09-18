import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserBooks, BookStatus } from '@/hooks/useUserBooks';
import { useRecommendations } from '@/hooks/useRecommendations';
import { Book, LogOut, User, Library, BookOpen, Star } from 'lucide-react';
import BookCard from '@/components/book/BookCard';
import { toast } from 'sonner';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { userBooks, getBooksByStatus } = useUserBooks();
  const { recommendations, isLoading: recommendationsLoading } = useRecommendations();
  const [activeTab, setActiveTab] = useState<BookStatus>('reading');

  if (!user) {
    navigate('/auth');
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
    navigate('/');
  };

  const tabs: { key: BookStatus; label: string; icon: React.ReactNode }[] = [
    { key: 'reading', label: 'Currently Reading', icon: <BookOpen className="h-4 w-4" /> },
    { key: 'want_to_read', label: 'Want to Read', icon: <Library className="h-4 w-4" /> },
    { key: 'read', label: 'Completed', icon: <Star className="h-4 w-4" /> },
  ];

  const currentBooks = getBooksByStatus(activeTab);

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
                to="/search"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Search Books
              </Link>

              <div className="flex items-center space-x-2 text-gray-700">
                <User className="h-4 w-4" />
                <span className="text-sm">{user.user_metadata?.name || user.email}</span>
              </div>

              <button
                onClick={handleSignOut}
                className="flex items-center space-x-1 text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">My Library</h2>
          <p className="text-gray-600">Manage your reading list and track your progress</p>
        </div>

        <div className="mb-8">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                  {getBooksByStatus(tab.key).length}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            {tabs.find(t => t.key === activeTab)?.label} ({currentBooks.length})
          </h3>

          {currentBooks.length === 0 ? (
            <div className="text-center py-16">
              <div className="mb-4">
                {activeTab === 'reading' && <BookOpen className="h-16 w-16 text-gray-300 mx-auto" />}
                {activeTab === 'want_to_read' && <Library className="h-16 w-16 text-gray-300 mx-auto" />}
                {activeTab === 'read' && <Star className="h-16 w-16 text-gray-300 mx-auto" />}
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                No books in this list yet
              </h4>
              <p className="text-gray-600 mb-6">
                {activeTab === 'reading' && "Start reading a book to track your progress"}
                {activeTab === 'want_to_read' && "Add books you want to read to your list"}
                {activeTab === 'read' && "Mark books as completed to see them here"}
              </p>
              <Link
                to="/search"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Book className="h-4 w-4 mr-2" />
                Discover Books
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {currentBooks.map((userBook) => {
                const book = {
                  id: userBook.book_id,
                  title: userBook.book_title,
                  author: userBook.book_author,
                  cover: userBook.book_cover || '/placeholder-book.jpg',
                  description: '',
                  genre: [],
                  rating: userBook.rating || 0,
                  year: 0,
                  amazonLink: ''
                };

                return (
                  <div key={userBook.id} className="relative">
                    <BookCard book={book} />

                    {userBook.rating && (
                      <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1">
                        <Star className="h-3 w-3 fill-current" />
                        <span>{userBook.rating}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg p-6 border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reading Stats</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {getBooksByStatus('read').length}
                </div>
                <div className="text-sm text-gray-600">Books Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {getBooksByStatus('reading').length}
                </div>
                <div className="text-sm text-gray-600">Currently Reading</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {getBooksByStatus('want_to_read').length}
                </div>
                <div className="text-sm text-gray-600">Want to Read</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommended for You</h3>
            {recommendationsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {recommendations.slice(0, 4).map((rec) => (
                  <div key={rec.book.id} className="relative">
                    <BookCard book={rec.book} />
                    {rec.reasons.length > 0 && (
                      <div className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                        {rec.reasons[0]}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            {recommendations.length > 4 && (
              <Link
                to="/search"
                className="block text-center text-blue-600 hover:underline mt-4 text-sm"
              >
                View all recommendations
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;