
import { Book } from "@/types";
import { BookCard } from "@/components/book-card";

interface BookGridProps {
  books: Book[];
  title?: string;
  description?: string;
  variant?: "default" | "horizontal";
}

export function BookGrid({ books, title, description, variant = "default" }: BookGridProps) {
  if (books.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">No books found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {(title || description) && (
        <div className="space-y-1">
          {title && <h2 className="text-2xl font-bold tracking-tight">{title}</h2>}
          {description && <p className="text-gray-500">{description}</p>}
        </div>
      )}
      
      {variant === "horizontal" ? (
        <div className="space-y-4">
          {books.map((book) => (
            <BookCard key={book.id} book={book} variant="horizontal" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </div>
  );
}
