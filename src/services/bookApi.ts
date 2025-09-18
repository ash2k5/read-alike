import { Book } from '@/types';
import { config } from '@/constants/config';
import { searchOpenLibrary, getOpenLibraryBookByISBN } from './openLibrary';
import { mergeBookData } from './bookDataMerger';

const { googleBooksApiUrl, googleBooksApiKey } = config;

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 1000 * 60 * 30; // 30 minutes

const getCachedData = (key: string) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  cache.delete(key);
  return null;
};

const setCachedData = (key: string, data: any) => {
  cache.set(key, { data, timestamp: Date.now() });
};

export const searchBooks = async (query: string, maxResults: number = 20): Promise<Book[]> => {
  const cacheKey = `search-${query}-${maxResults}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    console.log('🔍 Searching books:', query);

    // Search both sources in parallel
    const [googleResults, openLibraryResults] = await Promise.allSettled([
      searchGoogleBooks(query, maxResults),
      searchOpenLibrary(query, Math.min(maxResults, 10)) // Limit OL requests
    ]);

    const googleBooks = googleResults.status === 'fulfilled' ? googleResults.value : [];
    const openLibraryBooks = openLibraryResults.status === 'fulfilled' ? openLibraryResults.value : [];

    console.log(`📚 Found ${googleBooks.length} Google Books, ${openLibraryBooks.length} Open Library books`);

    // Merge and enhance book data
    const mergedBooks: Book[] = [];

    // Process Google Books first (primary source)
    for (const googleBook of googleBooks) {
      const isbn = getISBN(googleBook.volumeInfo);
      let openLibraryBook = null;

      // Try to find matching Open Library book for additional data
      if (isbn) {
        try {
          openLibraryBook = await getOpenLibraryBookByISBN(isbn);
        } catch (error) {
          console.warn('Failed to get Open Library data for ISBN:', isbn);
        }
      }

      const mergedBook = mergeBookData({
        google: googleBook,
        openLibrary: openLibraryBook || undefined
      });

      mergedBooks.push(mergedBook);
    }

    // Add unique Open Library books that weren't matched
    const googleTitles = new Set(googleBooks.map((book: any) =>
      book.volumeInfo?.title?.toLowerCase()
    ));

    for (const olBook of openLibraryBooks) {
      if (!googleTitles.has(olBook.title?.toLowerCase())) {
        const mergedBook = mergeBookData({
          openLibrary: olBook
        }, `ol-${olBook.key?.replace('/works/', '') || Math.random()}`);

        mergedBooks.push(mergedBook);
      }
    }

    const finalResults = mergedBooks.slice(0, maxResults);
    setCachedData(cacheKey, finalResults);

    console.log(`✅ Returning ${finalResults.length} merged books`);
    return finalResults;

  } catch (error) {
    console.error('Error searching books:', error);
    return [];
  }
};

const searchGoogleBooks = async (query: string, maxResults: number): Promise<any[]> => {
  if (!googleBooksApiKey) {
    console.warn('Google Books API key not configured');
    return [];
  }

  const url = `${googleBooksApiUrl}?q=${encodeURIComponent(query)}&maxResults=${maxResults}&key=${googleBooksApiKey}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Google Books API Error: ${response.status}`);
  }

  const data = await response.json();
  return data.items || [];
};

export const getBookById = async (id: string): Promise<Book | null> => {
  const cacheKey = `book-${id}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    console.log('📖 Getting book details:', id);

    // Check if it's an Open Library ID
    if (id.startsWith('ol-')) {
      const olKey = id.replace('ol-', '');
      const openLibraryBook = await getOpenLibraryBookDetails(olKey);
      if (openLibraryBook) {
        const book = mergeBookData({ openLibrary: openLibraryBook }, id);
        setCachedData(cacheKey, book);
        return book;
      }
      return null;
    }

    // Get from Google Books
    const url = `${googleBooksApiUrl}/${id}?key=${googleBooksApiKey}`;
    const response = await fetch(url);

    if (!response.ok) {
      return null;
    }

    const googleBook = await response.json();
    const isbn = getISBN(googleBook.volumeInfo);

    // Try to enhance with Open Library data
    let openLibraryBook = null;
    if (isbn) {
      try {
        openLibraryBook = await getOpenLibraryBookByISBN(isbn);
      } catch (error) {
        console.warn('Failed to enhance with Open Library data');
      }
    }

    const book = mergeBookData({
      google: googleBook,
      openLibrary: openLibraryBook || undefined
    });

    setCachedData(cacheKey, book);
    return book;

  } catch (error) {
    console.error('Error getting book by ID:', error);
    return null;
  }
};

const getOpenLibraryBookDetails = async (key: string): Promise<any> => {
  try {
    const response = await fetch(`https://openlibrary.org/works/${key}.json`);
    if (!response.ok) return null;

    const work = await response.json();
    return {
      key: work.key,
      title: work.title,
      authors: work.authors?.map((a: any) => ({ name: a.name })) || [],
      subject: work.subjects || [],
      first_publish_year: work.first_publish_date ? new Date(work.first_publish_date).getFullYear() : undefined,
      first_sentence: work.description ? [work.description] : []
    };
  } catch (error) {
    console.error('Error getting Open Library work details:', error);
    return null;
  }
};

const getISBN = (volumeInfo: any): string | undefined => {
  const identifiers = volumeInfo.industryIdentifiers || [];
  const isbn13 = identifiers.find((id: any) => id.type === 'ISBN_13');
  const isbn10 = identifiers.find((id: any) => id.type === 'ISBN_10');
  return (isbn13 || isbn10)?.identifier;
};

// Enhanced search with filters
export const searchBooksByGenre = async (genre: string, maxResults: number = 20): Promise<Book[]> => {
  const query = `subject:${genre}`;
  return searchBooks(query, maxResults);
};

export const searchBooksByAuthor = async (author: string, maxResults: number = 20): Promise<Book[]> => {
  const query = `inauthor:${author}`;
  return searchBooks(query, maxResults);
};