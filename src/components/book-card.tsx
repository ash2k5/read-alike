
import { Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Book as BookIcon } from "lucide-react";
import { Book } from "@/types";
import { Rating } from "@/components/ui/rating";
import { BookActions } from "@/components/book/book-actions";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/lib/supabase";

interface BookCardProps {
  book: Book;
  variant?: "default" | "horizontal";
}

export function BookCard({ book, variant = "default" }: BookCardProps) {
  const { user } = useSupabaseAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    
    async function checkFavorite() {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('user_favorites')
          .select('*')
          .eq('user_id', user.id)
          .eq('book_id', book.id)
          .single();
          
        if (!error && data) {
          setIsFavorite(true);
        }
      } catch (error) {
        console.error('Error checking favorite status:', error);
      }
    }
    
    checkFavorite();
  }, [user, book.id]);
  
  const toggleFavorite = async () => {
    if (!user) {
      toast.error('Please log in to add favorites');
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (isFavorite) {
        
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('book_id', book.id);
          
        if (error) {
          console.error('Error removing favorite:', error);
          toast.error('Failed to remove from favorites');
          return;
        }
        
        setIsFavorite(false);
        toast.success('Removed from favorites');
      } else {
        
        const { error } = await supabase
          .from('user_favorites')
          .insert({
            user_id: user.id,
            book_id: book.id,
            created_at: new Date().toISOString()
          });
          
        if (error) {
          console.error('Error adding favorite:', error);
          toast.error('Failed to add to favorites');
          return;
        }
        
        setIsFavorite(true);
        toast.success('Added to favorites');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  const fallbackImage = () => {
    return (
      <div className="flex items-center justify-center w-full h-full bg-gray-100 text-gray-400">
        <div className="text-center p-4">
          <BookIcon className="mx-auto mb-2" size={24} />
          <p className="text-xs line-clamp-2 text-gray-500">{book.title}</p>
        </div>
      </div>
    );
  };
  
  if (variant === "horizontal") {
    return (
      <div className="group fade-in flex items-start space-x-6 p-5 rounded-xl border border-gray-200 transition-all duration-300 hover:shadow-lg hover:border-book-purple/30 bg-white">
        <div className="flex-shrink-0 overflow-hidden rounded-lg w-28 h-40">
          <Link to={`/book/${book.id}`}>
            {book.cover && !imageError ? (
              <img 
                src={book.cover} 
                alt={book.title} 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                onError={() => setImageError(true)}
              />
            ) : fallbackImage()}
          </Link>
        </div>
        <div className="flex-1 min-w-0">
          <Link to={`/book/${book.id}`}>
            <h3 className="text-xl font-serif font-semibold text-gray-900 mb-1 hover:text-book-purple smooth-transition">{book.title}</h3>
          </Link>
          <p className="text-base text-gray-600 mb-2">{book.author}</p>
          <div className="mb-3">
            <Rating value={book.rating} showValue size="md" />
          </div>
          <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{book.description}</p>
          
          <div className="mt-4 flex items-center space-x-2">
            {user && <BookActions bookId={book.id} compact={true} />}
          </div>
        </div>
        <button
          onClick={toggleFavorite}
          disabled={isLoading}
          className="p-2 rounded-full hover:bg-gray-100 smooth-transition"
        >
          <Heart
            size={22}
            className={`smooth-transition ${
              isLoading ? "text-gray-300" : 
              isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"
            }`}
          />
        </button>
      </div>
    );
  }
  
  return (
    <div className="group fade-in relative flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-all duration-300 hover:shadow-lg hover:border-book-purple/30">
      <div className="absolute top-3 right-3 z-10">
        <button
          onClick={toggleFavorite}
          disabled={isLoading}
          className="p-1.5 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white smooth-transition"
        >
          <Heart
            size={20}
            className={`smooth-transition ${
              isLoading ? "text-gray-300" : 
              isFavorite ? "fill-red-500 text-red-500" : "text-gray-500"
            }`}
          />
        </button>
      </div>
      
      <Link to={`/book/${book.id}`} className="flex h-56 overflow-hidden">
        {book.cover && !imageError ? (
          <img
            src={book.cover}
            alt={book.title}
            className="object-cover w-full transition-transform duration-500 group-hover:scale-110"
            onError={() => setImageError(true)}
          />
        ) : (
          fallbackImage()
        )}
      </Link>
      
      <div className="flex flex-col flex-1 p-4">
        <Link to={`/book/${book.id}`}>
          <h3 className="font-serif font-medium text-gray-900 hover:text-book-purple truncate smooth-transition">{book.title}</h3>
        </Link>
        <p className="text-sm text-gray-600 mt-1">{book.author}</p>
        <div className="mt-auto pt-4 flex items-center justify-between">
          <Rating value={book.rating} size="sm" />
          <span className="text-xs text-gray-500 font-medium">{book.year}</span>
        </div>
        
        {user && (
          <div className="mt-3">
            <BookActions bookId={book.id} compact={true} />
          </div>
        )}
      </div>
    </div>
  );
}
