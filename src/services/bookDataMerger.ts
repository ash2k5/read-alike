import { Book } from '@/types';
import { OpenLibraryBook } from './openLibrary';
import { normalizeGenres } from '@/utils/genreMapper';

export interface BookSources {
  google?: any;
  openLibrary?: OpenLibraryBook;
}

export const mergeBookData = (sources: BookSources, fallbackId?: string): Book => {
  const { google, openLibrary } = sources;

  // Primary data from Google Books
  const googleData = google?.volumeInfo || {};

  // Extract ISBN for better cover lookup
  const isbn = googleData.industryIdentifiers?.find((id: any) =>
    id.type === 'ISBN_13' || id.type === 'ISBN_10'
  )?.identifier || openLibrary?.isbn?.[0];

  // Merge title (prefer Google, fallback to Open Library)
  const title = googleData.title || openLibrary?.title || 'Unknown Title';

  // Merge authors
  const authors = googleData.authors ||
    openLibrary?.authors?.map((a: any) => a.name) ||
    ['Unknown Author'];

  // Merge publication year
  const year = googleData.publishedDate ?
    new Date(googleData.publishedDate).getFullYear() :
    openLibrary?.first_publish_year || 0;

  // Merge and normalize genres/subjects
  const googleCategories = googleData.categories || [];
  const openLibrarySubjects = openLibrary?.subject?.slice(0, 5) || []; // Limit to avoid spam
  const rawGenres = [...googleCategories, ...openLibrarySubjects];
  const normalizedGenres = normalizeGenres(rawGenres);

  // Enhanced description
  const descriptions = [
    googleData.description,
    openLibrary?.first_sentence?.join(' ')
  ].filter(Boolean);

  const description = descriptions.length > 0 ?
    descriptions.join('\n\n') :
    'No description available';

  // Better cover selection
  const cover = getBestCover(googleData, openLibrary, isbn);

  // Enhanced rating (Google Books average rating)
  const rating = googleData.averageRating || 0;

  return {
    id: google?.id || fallbackId || generateBookId(title, authors[0]),
    title,
    author: authors.join(', '),
    cover,
    description: cleanDescription(description),
    genre: normalizedGenres,
    rating,
    year,
    amazonLink: generateAmazonLink(title, authors[0])
  };
};

const getBestCover = (googleData: any, openLibrary?: OpenLibraryBook, isbn?: string): string => {
  // Priority: Google Books large -> Open Library -> Google Books small -> placeholder

  // Try Google Books images (various sizes)
  if (googleData.imageLinks) {
    const sizes = ['extraLarge', 'large', 'medium', 'small', 'thumbnail'];
    for (const size of sizes) {
      if (googleData.imageLinks[size]) {
        // Remove curl effect and get higher quality
        return googleData.imageLinks[size]
          .replace('&edge=curl', '')
          .replace('zoom=1', 'zoom=2')
          .replace('http://', 'https://');
      }
    }
  }

  // Try Open Library cover by ID
  if (openLibrary?.cover_i) {
    return `https://covers.openlibrary.org/b/id/${openLibrary.cover_i}-L.jpg`;
  }

  // Try Open Library cover by ISBN
  if (isbn) {
    return `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
  }

  // Fallback to placeholder
  return '/placeholder-book.jpg';
};

const cleanDescription = (description: string): string => {
  if (!description) return 'No description available';

  // Remove HTML tags
  let cleaned = description.replace(/<[^>]*>/g, '');

  // Remove common unwanted patterns
  cleaned = cleaned
    .replace(/\r\n/g, '\n')
    .replace(/\n\s*\n/g, '\n\n')
    .trim();

  // Limit length to reasonable size
  if (cleaned.length > 1000) {
    return cleaned.substring(0, 997) + '...';
  }

  return cleaned;
};

const generateBookId = (title: string, author: string): string => {
  const cleanTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanAuthor = author.toLowerCase().replace(/[^a-z0-9]/g, '');
  return `${cleanTitle}-${cleanAuthor}`.substring(0, 50);
};

const generateAmazonLink = (title: string, author: string): string => {
  const searchQuery = encodeURIComponent(`${title} ${author}`);
  return `https://www.amazon.com/s?k=${searchQuery}&i=stripbooks`;
};