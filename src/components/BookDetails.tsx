import { Book } from '@/types';
import Image from 'next/image';
import { Star } from 'lucide-react';
import Link from 'next/link';

interface BookDetailsProps {
  book: Book;
}

export default function BookDetails({ book }: BookDetailsProps) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Book Cover */}
        <div className="relative aspect-[2/3] w-full max-w-sm mx-auto">
          <Image
            src={book.cover || '/placeholder-book.svg'}
            alt={book.title}
            fill
            className="object-cover rounded-lg shadow-lg"
            sizes="(max-width: 768px) 100vw, 33vw"
            priority
          />
        </div>

        {/* Book Info */}
        <div className="md:col-span-2 space-y-4">
          <h1 className="text-3xl font-bold">{book.title}</h1>
          <p className="text-xl text-gray-600">by {book.author}</p>
          
          <div className="flex items-center space-x-2">
            <Star className="w-5 h-5 text-yellow-400 fill-current" />
            <span className="text-lg font-semibold">{book.rating.toFixed(1)}</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {book.genre.map((genre) => (
              <span
                key={genre.id}
                className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
              >
                {genre.name}
              </span>
            ))}
          </div>

          {book.year && (
            <p className="text-gray-600">Published in {book.year}</p>
          )}

          {book.amazonLink && (
            <Link
              href={book.amazonLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              View on Amazon
            </Link>
          )}
        </div>
      </div>

      {/* Description */}
      {book.description && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Description</h2>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {book.description}
          </p>
        </div>
      )}
    </div>
  );
} 