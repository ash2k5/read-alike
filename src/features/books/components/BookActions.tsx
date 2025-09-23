import { useState } from 'react';
import { useAuth } from '@/features/auth/useAuth';
import { useUserBooks, BookStatus } from '@/features/books/useUserBooks';
import { Book } from '@/types';
import { Plus, Check, Star, MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';

interface BookActionsProps {
  book: Book;
  compact?: boolean;
}

const BookActions = ({ book, compact = false }: BookActionsProps) => {
  const { user } = useAuth();
  const {
    addBook,
    updateBook,
    removeBook,
    getBookStatus,
    getBookRating,
    isBookInList,
    isAddingBook
  } = useUserBooks();

  const [showDropdown, setShowDropdown] = useState(false);
  const [showRating, setShowRating] = useState(false);

  if (!user) {
    return null;
  }

  const currentStatus = getBookStatus(book.id);
  const currentRating = getBookRating(book.id);
  const inList = isBookInList(book.id);

  const handleAddToList = (status: BookStatus) => {
    addBook({ book, status });
    toast.success(`Added to ${status.replace('_', ' ')} list`);
    setShowDropdown(false);
  };

  const handleUpdateStatus = (status: BookStatus) => {
    if (currentStatus) {
      updateBook({ bookId: book.id, updates: { status } });
      toast.success(`Moved to ${status.replace('_', ' ')} list`);
    }
    setShowDropdown(false);
  };

  const handleRating = (rating: number) => {
    if (inList) {
      updateBook({ bookId: book.id, updates: { rating } });
      toast.success(`Rated ${rating} stars`);
    } else {
      addBook({ book, status: 'read' });
      setTimeout(() => {
        updateBook({ bookId: book.id, updates: { rating } });
      }, 100);
      toast.success(`Added to completed and rated ${rating} stars`);
    }
    setShowRating(false);
  };

  const handleRemove = () => {
    removeBook(book.id);
    toast.success('Removed from library');
    setShowDropdown(false);
  };

  const statusOptions: { key: BookStatus; label: string }[] = [
    { key: 'want_to_read', label: 'Want to Read' },
    { key: 'reading', label: 'Currently Reading' },
    { key: 'read', label: 'Completed' },
  ];

  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        {!inList ? (
          <button
            onClick={() => handleAddToList('want_to_read')}
            disabled={isAddingBook}
            className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            <Plus className="h-3 w-3" />
            <span>Add</span>
          </button>
        ) : (
          <span className="text-xs text-green-600 font-medium">
            ✓ {currentStatus?.replace('_', ' ')}
          </span>
        )}

        <button
          onClick={() => setShowRating(!showRating)}
          className="flex items-center space-x-1 px-2 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
        >
          <Star className={`h-3 w-3 ${currentRating ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
          {currentRating && <span className="text-xs">{currentRating}</span>}
        </button>

        {showRating && (
          <div className="absolute z-10 bg-white border border-gray-200 rounded-md shadow-lg p-2 flex space-x-1">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                onClick={() => handleRating(rating)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <Star className={`h-4 w-4 ${rating <= (currentRating || 0) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3">
      {!inList ? (
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            disabled={isAddingBook}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            <span>Add to List</span>
          </button>

          {showDropdown && (
            <div className="absolute top-full mt-1 left-0 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-10 min-w-48">
              {statusOptions.map((option) => (
                <button
                  key={option.key}
                  onClick={() => handleAddToList(option.key)}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 px-3 py-2 bg-green-100 text-green-800 rounded-md">
            <Check className="h-4 w-4" />
            <span className="text-sm font-medium">
              {currentStatus?.replace('_', ' ')}
            </span>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>

            {showDropdown && (
              <div className="absolute top-full mt-1 right-0 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-10 min-w-48">
                {statusOptions
                  .filter(option => option.key !== currentStatus)
                  .map((option) => (
                    <button
                      key={option.key}
                      onClick={() => handleUpdateStatus(option.key)}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Move to {option.label}
                    </button>
                  ))}
                <hr className="my-1" />
                <button
                  onClick={handleRemove}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  Remove from Library
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            onClick={() => handleRating(rating)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <Star className={`h-4 w-4 ${rating <= (currentRating || 0) ? 'text-yellow-500 fill-current' : 'text-gray-300 hover:text-yellow-400'}`} />
          </button>
        ))}
        {currentRating && (
          <span className="text-sm text-gray-600 ml-2">
            {currentRating}/5
          </span>
        )}
      </div>
    </div>
  );
};

export default BookActions;