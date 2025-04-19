import { getBookById } from '@/lib/bookApi';
import { notFound } from 'next/navigation';
import BookDetails from '@/components/BookDetails';
import SimilarBooks from '@/components/SimilarBooks';

interface BookPageProps {
  params: {
    id: string;
  };
}

export default async function BookPage({ params }: BookPageProps) {
  const book = await getBookById(params.id);

  if (!book) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <BookDetails book={book} />
      <SimilarBooks book={book} />
    </div>
  );
} 