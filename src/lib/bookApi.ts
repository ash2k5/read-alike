import { Book, Genre } from '@/types';
import * as XLSX from 'xlsx';

// Function to load and parse the Excel dataset
const loadLocalDataset = async (): Promise<Book[]> => {
  try {
    const response = await fetch('/kindle_books.xlsx');
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer);
    
    // Assuming the first sheet contains the data
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    return data.map(mapDatasetBookToBook);
  } catch (error) {
    console.error('Error loading Excel dataset:', error);
    return [];
  }
};

// Helper function to map your Excel data format to our Book type
const mapDatasetBookToBook = (row: any): Book => {
  // Create a more descriptive genre object using category data
  const genre: Genre = {
    id: `genre-${row.category_id || ''}`,
    name: row.category_name || 'Uncategorized'
  };

  // Get year from publishedDate
  const year = row.publishedDate ? new Date(row.publishedDate).getFullYear() : 0;
  
  return {
    id: String(row.asin || Math.random()),
    title: row.title || 'Unknown Title',
    author: row.author || 'Unknown Author',
    cover: row.imgUrl || '',
    description: `${row.isKindleUnlimited ? '📱 Kindle Unlimited\n' : ''}${row.isBestSeller ? '🏆 Bestseller\n' : ''}${row.isEditorsPick ? '👑 Editor\'s Pick\n' : ''}${row.isGoodReadsChoice ? '📚 Goodreads Choice\n' : ''}Sold by: ${row.soldBy || 'Unknown Seller'}`,
    genre: [genre],
    rating: Number(row.stars) || 0,
    year: year,
    reviews: [],
    amazonLink: row.productURL || generateAmazonLink(row.title, row.author)
  };
};

// Google Books API base URL
const GOOGLE_BOOKS_API_URL = 'https://www.googleapis.com/books/v1/volumes';

// Helper function to map Google Books API response to our Book type
const mapGoogleBookToBook = (item: any): Book => {
  const volumeInfo = item.volumeInfo;
  
  // Extract genres from categories
  const genres: Genre[] = (volumeInfo.categories || []).map((category: string, index: number) => ({
    id: `genre-${index}-${category.toLowerCase().replace(/\s+/g, '-')}`,
    name: category
  }));
  
  // Build the book object
  return {
    id: item.id,
    title: volumeInfo.title || 'Unknown Title',
    author: volumeInfo.authors ? volumeInfo.authors.join(', ') : 'Unknown Author',
    cover: volumeInfo.imageLinks?.thumbnail || '',
    description: volumeInfo.description || 'No description available',
    genre: genres.length > 0 ? genres : [{ id: 'genre-uncategorized', name: 'Uncategorized' }],
    rating: volumeInfo.averageRating || 0,
    year: volumeInfo.publishedDate ? new Date(volumeInfo.publishedDate).getFullYear() : 0,
    reviews: [],
    amazonLink: generateAmazonLink(volumeInfo.title, volumeInfo.authors?.[0])
  };
};

// Generate Amazon search link based on book title and author
export const generateAmazonLink = (title: string, author?: string): string => {
  const searchQuery = encodeURIComponent(`${title} ${author || ''}`);
  return `https://www.amazon.com/s?k=${searchQuery}&i=stripbooks`;
};

// Generate Kindle store link
export const generateKindleLink = (title: string, author?: string): string => {
  const searchQuery = encodeURIComponent(`${title} ${author || ''}`);
  return `https://www.amazon.com/s?k=${searchQuery}&i=digital-text`;
};

let localBooks: Book[] = [];

// Initialize the local dataset
const initializeLocalDataset = async () => {
  localBooks = await loadLocalDataset();
};

// Call initialization when the module loads
initializeLocalDataset();

// Search books with local dataset first, then fallback to Google Books API
export const searchBooks = async (query: string, startIndex: number = 0, maxResults: number = 40): Promise<Book[]> => {
  const searchTerms = query.toLowerCase().split(' ');
  
  // Search in local dataset first
  const localResults = localBooks
    .filter(book => 
      searchTerms.some(term => 
        book.title.toLowerCase().includes(term) ||
        book.author.toLowerCase().includes(term) ||
        book.description.toLowerCase().includes(term)
      )
    )
    .slice(startIndex, startIndex + maxResults);

  if (localResults.length > 0) {
    return localResults;
  }

  // Fallback to Google Books API if local search yields no results
  try {
    const kindleQuery = `${encodeURIComponent(query)} informat:epub`;
    const response = await fetch(`${GOOGLE_BOOKS_API_URL}?q=${kindleQuery}&startIndex=${startIndex}&maxResults=${maxResults}&orderBy=relevance`);
    const data = await response.json();
    
    if (!data.items) return [];
    
    return data.items
      .filter((item: any) => {
        const volumeInfo = item.volumeInfo;
        const saleInfo = item.saleInfo;
        return volumeInfo && (
          saleInfo?.isEbook === true || 
          volumeInfo.readingModes?.epub === true ||
          volumeInfo.readingModes?.pdf === true
        );
      })
      .map(mapGoogleBookToBook);
  } catch (error) {
    console.error('Error searching books:', error);
    return [];
  }
};

// Get books by genre using local dataset first
export const getBooksByGenre = async (genre: string, startIndex: number = 0, maxResults: number = 40): Promise<Book[]> => {
  // Search in local dataset first
  const localResults = localBooks
    .filter(book => 
      book.genre.some(g => g.name.toLowerCase() === genre.toLowerCase())
    )
    .slice(startIndex, startIndex + maxResults);

  if (localResults.length > 0) {
    return localResults;
  }

  // Fallback to Google Books API
  try {
    const kindleQuery = `subject:${encodeURIComponent(genre)} informat:epub`;
    const response = await fetch(`${GOOGLE_BOOKS_API_URL}?q=${kindleQuery}&startIndex=${startIndex}&maxResults=${maxResults}&orderBy=relevance`);
    const data = await response.json();
    
    if (!data.items) return [];
    
    return data.items
      .filter((item: any) => {
        const volumeInfo = item.volumeInfo;
        const saleInfo = item.saleInfo;
        return volumeInfo && (
          saleInfo?.isEbook === true || 
          volumeInfo.readingModes?.epub === true ||
          volumeInfo.readingModes?.pdf === true
        );
      })
      .map(mapGoogleBookToBook);
  } catch (error) {
    console.error('Error fetching books by genre:', error);
    return [];
  }
};

// Get book details by ID
export const getBookById = async (bookId: string): Promise<Book | null> => {
  try {
    const response = await fetch(`${GOOGLE_BOOKS_API_URL}/${bookId}`);
    const data = await response.json();
    
    if (!data || response.status !== 200) return null;
    
    return mapGoogleBookToBook(data);
  } catch (error) {
    console.error('Error fetching book details:', error);
    return null;
  }
};

// Get similar books based on a book's ID
export const getSimilarBooks = async (book: Book): Promise<Book[]> => {
  // Use the first genre of the book to find similar books
  if (book.genre.length === 0) return [];
  
  const genre = book.genre[0].name;
  const author = book.author.split(',')[0]; // Get the first author
  
  try {
    // Search for books with same genre but exclude the original book
    const genreResponse = await fetch(
      `${GOOGLE_BOOKS_API_URL}?q=subject:${encodeURIComponent(genre)}&maxResults=20`
    );
    const genreData = await genreResponse.json();
    
    // Search for books by the same author
    const authorResponse = await fetch(
      `${GOOGLE_BOOKS_API_URL}?q=inauthor:${encodeURIComponent(author)}&maxResults=10`
    );
    const authorData = await authorResponse.json();
    
    let similarBooks: Book[] = [];
    
    // Add books from same genre
    if (genreData.items) {
      similarBooks = [...similarBooks, ...genreData.items.map(mapGoogleBookToBook)];
    }
    
    // Add books from same author
    if (authorData.items) {
      similarBooks = [...similarBooks, ...authorData.items.map(mapGoogleBookToBook)];
    }
    
    // Remove duplicates and the original book
    const uniqueBooks = similarBooks.filter(
      (similarBook, index, self) => 
        similarBook.id !== book.id && 
        index === self.findIndex(b => b.id === similarBook.id)
    );
    
    return uniqueBooks.slice(0, 5); // Return max 5 similar books
  } catch (error) {
    console.error('Error fetching similar books:', error);
    return [];
  }
};

// Get more books for pagination (load next page)
export const getMoreBooks = async (query: string, startIndex: number, maxResults: number = 40): Promise<Book[]> => {
  return searchBooks(query, startIndex, maxResults);
};

// Get more books by genre for pagination
export const getMoreBooksByGenre = async (genre: string, startIndex: number, maxResults: number = 40): Promise<Book[]> => {
  return getBooksByGenre(genre, startIndex, maxResults);
};
