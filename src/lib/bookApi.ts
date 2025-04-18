import { Book, Genre } from '@/types';

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

// Search books by query with pagination support, focusing on Kindle editions
export const searchBooks = async (query: string, startIndex: number = 0, maxResults: number = 40): Promise<Book[]> => {
  try {
    // Add informat:epub to target digital/ebook formats
    const kindleQuery = `${encodeURIComponent(query)} informat:epub`;
    const response = await fetch(`${GOOGLE_BOOKS_API_URL}?q=${kindleQuery}&startIndex=${startIndex}&maxResults=${maxResults}&orderBy=relevance`);
    const data = await response.json();
    
    if (!data.items) return [];
    
    // Filter out books without buyLinks or that aren't available as ebooks
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

// Get books by genre/category with pagination support, focusing on Kindle editions
export const getBooksByGenre = async (genre: string, startIndex: number = 0, maxResults: number = 40): Promise<Book[]> => {
  try {
    // Add informat:epub to target digital/ebook formats
    const kindleQuery = `subject:${encodeURIComponent(genre)} informat:epub`;
    const response = await fetch(`${GOOGLE_BOOKS_API_URL}?q=${kindleQuery}&startIndex=${startIndex}&maxResults=${maxResults}&orderBy=relevance`);
    const data = await response.json();
    
    if (!data.items) return [];
    
    // Filter out books without buyLinks or that aren't available as ebooks
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
