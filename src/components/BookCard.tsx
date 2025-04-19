import { Book } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { Star } from 'lucide-react';

interface BookCardProps {
  book: Book;
}

export default function BookCard({ book }: BookCardProps) {
  return (
    <Link href={`/books/${book.id}`} className="group">
      <div className="flex flex-col h-full bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
        <div className="relative aspect-[2/3] w-full">
          <Image
            src={book.cover || '/placeholder-book.svg'}
            alt={book.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        
        <div className="p-4 flex flex-col flex-grow">
          <h3 className="font-semibold text-lg mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {book.title}
          </h3>
          
          <p className="text-gray-600 text-sm mb-2 line-clamp-1">
            {book.author}
          </p>
          
          <div className="flex items-center mt-auto">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="ml-1 text-sm text-gray-600">
              {book.rating.toFixed(1)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
} 