
import { Book } from '@/types';
import { ExternalLink, ShoppingCart, BookOpen } from 'lucide-react';
import { generateAmazonLink, generateKindleLink } from '@/lib/bookApi';

interface BookStoreLinksProps {
  book: Book;
}

export function BookStoreLinks({ book }: BookStoreLinksProps) {
  return (
    <div className="flex flex-wrap gap-3 mt-6">
      <a
        href={book.amazonLink || generateAmazonLink(book.title, book.author)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center bg-book-purple hover:bg-book-purple-dark text-white font-medium px-5 py-2.5 rounded-lg transition"
      >
        <ShoppingCart size={18} className="mr-2" />
        Buy on Amazon
      </a>
      
      <a
        href={generateKindleLink(book.title, book.author)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center border border-book-purple bg-white text-book-purple hover:bg-book-purple/10 font-medium px-5 py-2.5 rounded-lg transition"
      >
        <BookOpen size={18} className="mr-2" />
        Kindle Edition
      </a>
    </div>
  );
}
