import { Book } from '@/types';

interface OpenLibrarySearchResponse {
  docs: OpenLibraryDoc[];
  numFound: number;
}

interface OpenLibraryDoc {
  key: string;
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  isbn?: string[];
  cover_i?: number;
  subject?: string[];
  publisher?: string[];
  language?: string[];
  ratings_average?: number;
  ratings_count?: number;
  description?: string;
  seed?: string[];
}

interface OpenLibraryWork {
  title: string;
  description?: string | { value: string };
  covers?: number[];
  subjects?: string[];
  authors?: Array<{ author: { key: string } }>;
}

const OPEN_LIBRARY_BASE = 'https://openlibrary.org';
const COVERS_BASE = 'https://covers.openlibrary.org/b';

// Enhanced cache with longer duration for better performance
const searchCache = new Map<string, { data: Book[]; timestamp: number }>();
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

function getCachedSearch(query: string): Book[] | null {
  const cached = searchCache.get(query);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
}

function setCachedSearch(query: string, data: Book[]): void {
  searchCache.set(query, { data, timestamp: Date.now() });

  // Cleanup old cache entries
  if (searchCache.size > 100) {
    const entries = Array.from(searchCache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    for (let i = 0; i < 20; i++) {
      searchCache.delete(entries[i][0]);
    }
  }
}

export async function enhancedSearchBooks(query: string, maxResults: number = 20): Promise<Book[]> {
  const cached = getCachedSearch(query);
  if (cached) {
    return cached.slice(0, maxResults);
  }

  try {
    // Enhanced search with better parameters
    const searchParams = new URLSearchParams({
      q: query,
      limit: Math.min(maxResults * 2, 100).toString(), // Get more for better filtering
      fields: 'key,title,author_name,first_publish_year,isbn,cover_i,subject,publisher,language,ratings_average,ratings_count,seed',
      sort: 'rating desc', // Sort by rating for better quality results
    });

    const response = await fetch(`${OPEN_LIBRARY_BASE}/search.json?${searchParams}`);

    if (!response.ok) {
      throw new Error(`Search failed: ${response.status}`);
    }

    const data: OpenLibrarySearchResponse = await response.json();

    // Enhanced processing with better filtering and data enrichment
    const booksPromises = data.docs
      .filter(doc =>
        doc.title &&
        doc.author_name &&
        doc.author_name.length > 0 &&
        doc.first_publish_year &&
        doc.first_publish_year > 1800 // Filter out very old/invalid dates
      )
      .slice(0, maxResults)
      .map(async (doc) => {
        const book: Book = {
          id: doc.key.replace('/works/', ''),
          title: doc.title,
          author: doc.author_name?.[0] || 'Unknown Author',
          cover: doc.cover_i ? `${COVERS_BASE}/id/${doc.cover_i}-L.jpg` : '/placeholder-book.jpg',
          description: await getEnhancedDescription(doc.key),
          genre: normalizeGenres(doc.subject || []),
          rating: doc.ratings_average || 0,
          year: doc.first_publish_year || 0,
          amazonLink: generateAmazonLink(doc.title, doc.author_name?.[0])
        };

        return book;
      });

    const books = await Promise.all(booksPromises);

    // Remove duplicates and sort by relevance
    const uniqueBooks = removeDuplicates(books);
    const sortedBooks = sortByRelevance(uniqueBooks, query);

    setCachedSearch(query, sortedBooks);
    return sortedBooks;

  } catch (error) {
    console.error('Enhanced search failed:', error);
    return [];
  }
}

async function getEnhancedDescription(workKey: string): Promise<string> {
  try {
    const response = await fetch(`${OPEN_LIBRARY_BASE}${workKey}.json`);
    if (!response.ok) return 'No description available';

    const work: OpenLibraryWork = await response.json();

    if (work.description) {
      if (typeof work.description === 'string') {
        return work.description;
      } else if (work.description.value) {
        return work.description.value;
      }
    }

    return 'No description available';
  } catch {
    return 'No description available';
  }
}

function normalizeGenres(subjects: string[]): string[] {
  const genreMap: Record<string, string> = {
    'fiction': 'Fiction',
    'science fiction': 'Science Fiction',
    'fantasy': 'Fantasy',
    'mystery': 'Mystery',
    'thriller': 'Thriller',
    'romance': 'Romance',
    'horror': 'Horror',
    'biography': 'Biography',
    'history': 'History',
    'philosophy': 'Philosophy',
    'psychology': 'Psychology',
    'science': 'Science',
    'technology': 'Technology',
    'business': 'Business',
    'self-help': 'Self-Help',
    'health': 'Health',
    'cooking': 'Cooking',
    'travel': 'Travel',
    'art': 'Art',
    'music': 'Music',
    'poetry': 'Poetry',
    'drama': 'Drama',
    'religion': 'Religion',
    'politics': 'Politics',
    'economics': 'Economics',
    'education': 'Education',
    'children': 'Children',
    'young adult': 'Young Adult',
    'graphic novels': 'Graphic Novel',
    'comics': 'Comics'
  };

  return subjects
    .slice(0, 5) // Limit to 5 genres
    .map(subject => {
      const normalized = subject.toLowerCase().trim();
      return genreMap[normalized] ||
             subject.split(' ').map(word =>
               word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
             ).join(' ');
    })
    .filter((genre, index, arr) => arr.indexOf(genre) === index); // Remove duplicates
}

function removeDuplicates(books: Book[]): Book[] {
  const seen = new Set<string>();
  return books.filter(book => {
    const key = `${book.title.toLowerCase()}-${book.author.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function sortByRelevance(books: Book[], query: string): Book[] {
  const queryLower = query.toLowerCase();

  return books.sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;

    // Title relevance (highest weight)
    if (a.title.toLowerCase().includes(queryLower)) scoreA += 10;
    if (b.title.toLowerCase().includes(queryLower)) scoreB += 10;

    // Author relevance
    if (a.author.toLowerCase().includes(queryLower)) scoreA += 8;
    if (b.author.toLowerCase().includes(queryLower)) scoreB += 8;

    // Rating bonus
    scoreA += a.rating * 2;
    scoreB += b.rating * 2;

    // Recent publication bonus
    if (a.year >= 2000) scoreA += 1;
    if (b.year >= 2000) scoreB += 1;

    // Genre diversity bonus
    scoreA += Math.min(a.genre.length, 3);
    scoreB += Math.min(b.genre.length, 3);

    return scoreB - scoreA;
  });
}

function generateAmazonLink(title: string, author?: string): string {
  const searchQuery = encodeURIComponent(`${title} ${author || ''}`);
  return `https://www.amazon.com/s?k=${searchQuery}&i=stripbooks`;
}

export async function getEnhancedBookById(id: string): Promise<Book | null> {
  try {
    const workKey = `/works/${id}`;
    const response = await fetch(`${OPEN_LIBRARY_BASE}${workKey}.json`);

    if (!response.ok) {
      throw new Error(`Book not found: ${response.status}`);
    }

    const work: OpenLibraryWork = await response.json();

    // Get additional metadata from editions
    const editionsResponse = await fetch(`${OPEN_LIBRARY_BASE}${workKey}/editions.json?limit=1`);
    const editionsData = await editionsResponse.json();
    const edition = editionsData.entries?.[0];

    const book: Book = {
      id,
      title: work.title,
      author: 'Unknown Author', // Will be populated from editions or authors API
      cover: work.covers?.[0] ? `${COVERS_BASE}/id/${work.covers[0]}-L.jpg` : '/placeholder-book.jpg',
      description: typeof work.description === 'string'
        ? work.description
        : work.description?.value || 'No description available',
      genre: normalizeGenres(work.subjects || []),
      rating: 0, // Could be enhanced with ratings API
      year: edition?.publish_date ? new Date(edition.publish_date).getFullYear() : 0,
      amazonLink: generateAmazonLink(work.title)
    };

    return book;

  } catch (error) {
    console.error('Enhanced book fetch failed:', error);
    return null;
  }
}

// Trending books functionality
export async function getTrendingBooks(limit: number = 20): Promise<Book[]> {
  const trendingQueries = [
    'bestseller 2024',
    'award winning fiction',
    'popular romance',
    'trending science fiction',
    'new releases'
  ];

  try {
    const allBooks: Book[] = [];

    for (const query of trendingQueries) {
      const books = await enhancedSearchBooks(query, Math.ceil(limit / trendingQueries.length));
      allBooks.push(...books);
    }

    // Remove duplicates and return top rated books
    const uniqueBooks = removeDuplicates(allBooks);
    return uniqueBooks
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);

  } catch (error) {
    console.error('Trending books fetch failed:', error);
    return [];
  }
}