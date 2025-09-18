import { useState } from "react";
import { Link } from "react-router-dom";
import { Star, Book as BookIcon } from "lucide-react";
import { Book } from "@/types";
import { getGenreColor } from "@/utils/genreMapper";
import BookActions from "./BookActions";

interface BookCardProps {
  book: Book;
}

const BookCard = ({ book }: BookCardProps) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const fallbackImage = () => {
    return (
      <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 text-gray-400">
        <div className="text-center p-4">
          <BookIcon className="mx-auto mb-2 h-8 w-8" />
          <p className="text-xs font-medium line-clamp-2 text-gray-600">
            {book.title}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <Link to={`/book/${book.id}`}>
        <div className="relative w-full h-64 overflow-hidden bg-gray-100">
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}

          {!imageError ? (
            <img
              src={book.cover}
              alt={book.title}
              className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${
                imageLoading ? 'opacity-0' : 'opacity-100'
              }`}
              onLoad={handleImageLoad}
              onError={handleImageError}
              loading="lazy"
            />
          ) : (
            fallbackImage()
          )}

          {/* Genre badge overlay */}
          {book.genre.length > 0 && (
            <div className="absolute top-2 left-2">
              <span className={`text-xs px-2 py-1 rounded-full backdrop-blur-sm font-medium ${getGenreColor(book.genre[0])}`}>
                {book.genre[0]}
              </span>
            </div>
          )}

          {/* Rating overlay */}
          {book.rating > 0 && (
            <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1 backdrop-blur-sm">
              <Star className="h-3 w-3 text-yellow-400 fill-current" />
              <span>{book.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        <Link to={`/book/${book.id}`}>
          <h3 className="font-semibold text-gray-900 mb-1 hover:text-blue-600 transition-colors line-clamp-2 group-hover:text-blue-700">
            {book.title}
          </h3>
        </Link>

        <p className="text-gray-600 text-sm mb-2 line-clamp-1">{book.author}</p>

        {/* Description preview */}
        {book.description && book.description !== 'No description available' && (
          <p className="text-gray-500 text-xs mb-3 line-clamp-2">
            {book.description.replace(/<[^>]*>/g, '')}
          </p>
        )}

        {/* User actions */}
        <div className="mb-3">
          <BookActions book={book} compact />
        </div>

        {/* Bottom section with year and genres */}
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {book.genre.slice(0, 2).map((genre, index) => (
              <span
                key={index}
                className={`px-2 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer hover:scale-105 ${getGenreColor(genre)}`}
              >
                {genre}
              </span>
            ))}
          </div>

          {book.year > 0 && (
            <span className="text-xs text-gray-500 font-medium">
              {book.year}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookCard;