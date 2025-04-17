
import { Book } from "@/types";
import { Rating } from "@/components/ui/rating";
import { Heart } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

interface BookCardProps {
  book: Book;
  variant?: "default" | "horizontal";
}

export function BookCard({ book, variant = "default" }: BookCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  
  if (variant === "horizontal") {
    return (
      <div className="flex items-start space-x-4 p-4 rounded-lg border border-gray-200 transition-all duration-200 hover:shadow-md bg-white">
        <div className="flex-shrink-0">
          <Link to={`/book/${book.id}`}>
            <img 
              src={book.cover} 
              alt={book.title} 
              className="w-24 h-36 object-cover rounded-md shadow-sm" 
            />
          </Link>
        </div>
        <div className="flex-1 min-w-0">
          <Link to={`/book/${book.id}`}>
            <h3 className="text-lg font-semibold text-gray-900 truncate hover:text-book-purple-dark">{book.title}</h3>
          </Link>
          <p className="text-sm text-gray-600">{book.author}</p>
          <div className="mt-1">
            <Rating value={book.rating} showValue />
          </div>
          <p className="mt-2 text-sm text-gray-500 line-clamp-2">{book.description}</p>
        </div>
        <button
          onClick={() => setIsFavorite(!isFavorite)}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          <Heart
            size={20}
            className={isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"}
          />
        </button>
      </div>
    );
  }
  
  return (
    <div className="relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white transition-all duration-200 hover:shadow-md">
      <div className="absolute top-2 right-2 z-10">
        <button
          onClick={() => setIsFavorite(!isFavorite)}
          className="p-1.5 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white"
        >
          <Heart
            size={18}
            className={isFavorite ? "fill-red-500 text-red-500" : "text-gray-500"}
          />
        </button>
      </div>
      
      <Link to={`/book/${book.id}`} className="flex h-48 overflow-hidden">
        <img
          src={book.cover}
          alt={book.title}
          className="object-cover w-full transition-transform duration-300 hover:scale-105"
        />
      </Link>
      
      <div className="flex flex-col flex-1 p-4">
        <Link to={`/book/${book.id}`}>
          <h3 className="font-medium text-gray-900 hover:text-book-purple truncate">{book.title}</h3>
        </Link>
        <p className="text-sm text-gray-600 mt-1">{book.author}</p>
        <div className="mt-auto pt-3 flex items-center justify-between">
          <Rating value={book.rating} size="sm" />
          <span className="text-xs text-gray-500">{book.year}</span>
        </div>
      </div>
    </div>
  );
}
