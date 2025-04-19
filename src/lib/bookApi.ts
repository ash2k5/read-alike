import { Book, Genre } from '@/types';
import { scrapeAmazonBookData, scrapeAmazonBookDetails } from './amazonScraper';
import { getBookDescription } from './webScraper';
import { getAdditionalBookData } from './additionalDataSources';
import { cacheManager } from './cacheManager';
import { config } from './config';

const GOOGLE_BOOKS_API_URL = config.googleBooksApiUrl;
const GOOGLE_BOOKS_API_KEY = config.googleBooksApiKey;
const OPEN_LIBRARY_COVERS_URL = config.openLibraryCoversUrl;

const cleanHtmlTags = (text: string): string => {
  if (!text) return '';
  return text.replace(/<[^>]*>/g, '');
};

const validateImageUrl = async (url: string): Promise<boolean> => {
  if (!url) return false;
  try {
    const response = await fetch(url);
    if (!response.ok) return false;
    
    const contentType = response.headers.get('content-type');
    if (!contentType?.startsWith('image/')) return false;
    
    const buffer = await response.arrayBuffer();
    return buffer.byteLength > 1000; // Ensure the image has some content
  } catch (error) {
    console.error('Error validating image URL:', url, error);
    return false;
  }
};

const getBestCoverImage = async (volumeInfo: any, isbn?: string, title?: string, author?: string): Promise<string> => {
  const cacheKey = `cover-${isbn || title}-${author}`;
  return cacheManager.get(cacheKey, async () => {
    console.log('Fetching cover for:', { title, author, isbn });

    if (volumeInfo.imageLinks) {
      console.log('Google Books image links available:', volumeInfo.imageLinks);
      
      const imageSizes = ['extraLarge', 'large', 'medium', 'small', 'thumbnail'];
      for (const size of imageSizes) {
        const imageUrl = volumeInfo.imageLinks[size];
        if (imageUrl) {
          console.log(`Trying Google Books ${size} image:`, imageUrl);
          const cleanUrl = imageUrl.replace('&edge=curl', '');
          if (await validateImageUrl(cleanUrl)) {
            return cleanUrl;
          }
        }
      }
    }

    if (isbn) {
      const sizes = ['L', 'M', 'S'];
      for (const size of sizes) {
        const openLibraryUrl = `https://covers.openlibrary.org/b/isbn/${isbn}-${size}.jpg`;
        console.log('Trying Open Library ISBN image:', openLibraryUrl);
        if (await validateImageUrl(openLibraryUrl)) {
          return openLibraryUrl;
        }
      }
    }

    if (title) {
      const searchUrl = `https://covers.openlibrary.org/b/title/${encodeURIComponent(title)}-L.jpg`;
      console.log('Trying Open Library search image:', searchUrl);
      if (await validateImageUrl(searchUrl)) {
        return searchUrl;
      }
    }

    if (title && author) {
      const searchQuery = encodeURIComponent(`${title} ${author}`);
      const googleSearchUrl = `https://www.googleapis.com/books/v1/volumes?q=${searchQuery}&maxResults=1`;
      try {
        const response = await fetch(googleSearchUrl);
        const data = await response.json();
        if (data.items?.[0]?.volumeInfo?.imageLinks) {
          const imageUrl = data.items[0].volumeInfo.imageLinks.thumbnail;
          if (imageUrl && await validateImageUrl(imageUrl)) {
            return imageUrl;
          }
        }
      } catch (error) {
        console.error('Error searching Google Books:', error);
      }
    }

    if (title) {
      try {
        console.log('Trying Amazon scraping for:', title);
        const amazonData = await scrapeAmazonBookData(title, author);
        if (amazonData.cover && await validateImageUrl(amazonData.cover)) {
          console.log('Found valid Amazon cover:', amazonData.cover);
          return amazonData.cover;
        }
      } catch (error) {
        console.error('Error getting Amazon cover:', error);
      }
    }

    console.log('No valid cover found, using placeholder');
    return '/placeholder-book.svg';
  });
};

const getISBN = (volumeInfo: any): string | undefined => {
  const identifiers = volumeInfo.industryIdentifiers || [];
  const isbn13 = identifiers.find((id: any) => id.type === 'ISBN_13');
  const isbn10 = identifiers.find((id: any) => id.type === 'ISBN_10');
  return (isbn13 || isbn10)?.identifier;
};

const getBookRating = async (title: string, author?: string): Promise<number> => {
  const cacheKey = `rating-${title}-${author}`;
  return cacheManager.get(cacheKey, async () => {
    const amazonData = await scrapeAmazonBookData(title, author);
    return amazonData.rating || 0;
  });
};

const formatDescription = (sources: string[]): string => {
  const validDescriptions = sources.filter(desc => desc && desc.trim() !== '');
  
  if (validDescriptions.length === 0) {
    return 'No description available';
  }

  return validDescriptions
    .map(desc => cleanHtmlTags(desc.trim()))
    .map(desc => {
      if (!desc.match(/[.!?]$/)) {
        desc += '.';
      }
      return desc;
    })
    .join('\n\n'); 
};

const getAmazonData = async (title: string, author?: string, volumeInfo?: any): Promise<Partial<Book>> => {
  const cacheKey = `amazon-${title}-${author}`;
  return cacheManager.get(cacheKey, async () => {
    const amazonData = await scrapeAmazonBookData(title, author);
    const amazonDetails = amazonData.amazonLink ? await scrapeAmazonBookDetails(amazonData.amazonLink) : {};
    
    const description = formatDescription([
      amazonDetails.description,
      volumeInfo?.description
    ]);
  
  return {
      description,
      genre: amazonDetails.genre || [],
      amazonLink: amazonData.amazonLink || generateAmazonLink(title, author),
      rating: amazonData.rating || 0
    };
  });
};

const getBookGenres = async (volumeInfo: any, title: string, author?: string): Promise<Genre[]> => {
  const cacheKey = `genres-${title}-${author}`;
  return cacheManager.get(cacheKey, async () => {
    const genres: Genre[] = [];

    if (volumeInfo.categories) {
      genres.push(...volumeInfo.categories.map((category: string, index: number) => ({
        id: `genre-google-${index}-${category.toLowerCase().replace(/\s+/g, '-')}`,
        name: category
      })));
    }

    try {
      const amazonData = await scrapeAmazonBookData(title, author);
      const amazonDetails = amazonData.amazonLink ? await scrapeAmazonBookDetails(amazonData.amazonLink) : {};
      
      if (amazonDetails.genre) {
        genres.push(...amazonDetails.genre);
      }
    } catch (error) {
      console.error('Error getting Amazon genres:', error);
    }

    if (volumeInfo.description) {
      const commonGenres = [
        'Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Science Fiction', 'Fantasy',
        'Thriller', 'Horror', 'Biography', 'History', 'Self-Help', 'Business',
        'Young Adult', 'Children', 'Poetry', 'Drama', 'Comedy', 'Adventure'
      ];

      const description = volumeInfo.description.toLowerCase();
      const foundGenres = commonGenres.filter(genre => 
        description.includes(genre.toLowerCase())
      );

      genres.push(...foundGenres.map((genre, index) => ({
        id: `genre-desc-${index}-${genre.toLowerCase().replace(/\s+/g, '-')}`,
        name: genre
      })));
    }

    const uniqueGenres = genres.filter((genre, index, self) => 
      index === self.findIndex(g => g.name.toLowerCase() === genre.name.toLowerCase())
    );

    if (uniqueGenres.length === 0) {
      const defaultGenre = determineDefaultGenre(volumeInfo);
      uniqueGenres.push({
        id: 'genre-default-uncategorized',
        name: defaultGenre
      });
    }

    return uniqueGenres;
  });
};

const determineDefaultGenre = (volumeInfo: any): string => {
  if (volumeInfo.maturityRating === 'NOT_MATURE') {
    return 'Children';
  }

  if (volumeInfo.categories?.some((cat: string) => 
    cat.toLowerCase().includes('textbook') || 
    cat.toLowerCase().includes('education')
  )) {
    return 'Educational';
  }

  if (volumeInfo.description) {
    const desc = volumeInfo.description.toLowerCase();
    if (desc.includes('novel') || desc.includes('story') || desc.includes('tale')) {
      return 'Fiction';
    }
    if (desc.includes('history') || desc.includes('biography') || desc.includes('memoir')) {
      return 'Non-Fiction';
    }
  }

  return 'General';
};

const mapGoogleBookToBook = async (item: any): Promise<Book> => {
  const volumeInfo = item.volumeInfo;
  const isbn = getISBN(volumeInfo);
  const title = volumeInfo.title;
  const author = volumeInfo.authors?.[0];

  let cover = '';
  try {
    cover = await getBestCoverImage(volumeInfo, isbn, title, author);
  } catch (error) {
    console.error('Error getting cover image:', error);
  }

  let amazonData: Partial<Book> = {};
  try {
    amazonData = await getAmazonData(title, author, volumeInfo);
  } catch (error) {
    console.error('Error getting Amazon data:', error);
  }

  let genres: Genre[] = [];
  try {
    genres = await getBookGenres(volumeInfo, title, author);
  } catch (error) {
    console.error('Error getting genres:', error);
    genres = [{ id: 'genre-default-uncategorized', name: 'General' }];
  }

  return {
    id: item.id,
    title: title || 'Unknown Title',
    author: volumeInfo.authors ? volumeInfo.authors.join(', ') : 'Unknown Author',
    cover: cover || '/placeholder-book.svg',
    description: amazonData.description || formatDescription([volumeInfo.description]),
    genre: genres,
    rating: amazonData.rating || 0,
    year: volumeInfo.publishedDate ? new Date(volumeInfo.publishedDate).getFullYear() : 0,
    reviews: [],
    amazonLink: amazonData.amazonLink || generateAmazonLink(title, author)
  };
};

export const generateAmazonLink = (title: string, author?: string): string => {
  const searchQuery = encodeURIComponent(`${title} ${author || ''}`);
  return `https://www.amazon.com/s?k=${searchQuery}&i=stripbooks`;
};

export const generateKindleLink = (title: string, author?: string): string => {
  const searchQuery = encodeURIComponent(`${title} ${author || ''}`);
  return `https://www.amazon.com/s?k=${searchQuery}&i=digital-text`;
};

const makeApiRequest = async (url: string): Promise<any> => {
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('API key is invalid or quota exceeded');
      }
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

export const searchBooks = async (query: string, startIndex: number = 0, maxResults: number = 40): Promise<Book[]> => {
  try {
    console.log('Searching books with query:', query);
    
    const cacheKey = `search-${query}-${startIndex}-${maxResults}`;
    return cacheManager.get(cacheKey, async () => {
      const searchUrl = `${GOOGLE_BOOKS_API_URL}?q=${encodeURIComponent(query)}&startIndex=${startIndex}&maxResults=${maxResults}&orderBy=relevance&key=${GOOGLE_BOOKS_API_KEY}`;
      console.log('Fetching from URL:', searchUrl);
      
      const data = await makeApiRequest(searchUrl);
      console.log('Received data items:', data.items?.length || 0);
      
      if (!data.items || data.items.length === 0) {
        console.log('No books found for query:', query);
        return [];
      }
      
      const batchSize = 5;
      const books: Book[] = [];
      
      for (let i = 0; i < data.items.length; i += batchSize) {
        const batch = data.items.slice(i, i + batchSize);
        console.log(`Processing batch ${i / batchSize + 1} of ${Math.ceil(data.items.length / batchSize)}`);
        
        try {
          const batchResults = await Promise.all(batch.map(mapGoogleBookToBook));
          books.push(...batchResults);
        } catch (error) {
          console.error('Error processing batch:', error);
          continue;
        }
      }
      
      console.log('Successfully processed books:', books.length);
      return books;
    });
  } catch (error) {
    console.error('Error in searchBooks:', error);
    return [];
  }
};

export const getBooksByGenre = async (genre: string, startIndex: number = 0, maxResults: number = 40): Promise<Book[]> => {
  try {
    const response = await fetch(
      `${GOOGLE_BOOKS_API_URL}?q=subject:${encodeURIComponent(genre)}&startIndex=${startIndex}&maxResults=${maxResults}&orderBy=relevance`
    );
    const data = await response.json();
    
    if (!data.items) return [];
    
    const books = await Promise.all(data.items.map(mapGoogleBookToBook));
    return books;
  } catch (error) {
    console.error('Error fetching books by genre:', error);
    return [];
  }
};

export const getBookById = async (bookId: string): Promise<Book | null> => {
  try {
    const response = await fetch(`${GOOGLE_BOOKS_API_URL}/${bookId}`);
    const data = await response.json();
    
    if (!data || response.status !== 200) return null;
    
    return await mapGoogleBookToBook(data);
  } catch (error) {
    console.error('Error fetching book details:', error);
    return null;
  }
};

export const getSimilarBooks = async (book: Book, limit: number = 5): Promise<Book[]> => {
  try {
    console.log('Finding similar books for:', book.title);
    
    const primaryGenre = book.genre[0]?.name;
    if (!primaryGenre) {
      console.log('No genre found for book');
      return [];
    }
    
    const cacheKey = `similar-${book.id}-${primaryGenre}-${limit}`;
    return cacheManager.get(cacheKey, async () => {
      const searchUrl = `${GOOGLE_BOOKS_API_URL}?q=subject:${encodeURIComponent(primaryGenre)}&maxResults=${limit + 1}&key=${GOOGLE_BOOKS_API_KEY}`;
      console.log('Searching similar books with URL:', searchUrl);
      
      const data = await makeApiRequest(searchUrl);
      
      if (!data.items || data.items.length === 0) {
        console.log('No similar books found');
        return [];
      }
      
      const similarBooks = await Promise.all(
        data.items
          .filter((item: any) => item.id !== book.id)
          .slice(0, limit)
          .map(mapGoogleBookToBook)
      );
      
      console.log('Found similar books:', similarBooks.length);
      return similarBooks;
    });
  } catch (error) {
    console.error('Error finding similar books:', error);
    return [];
  }
};

export const getMoreBooks = async (query: string, startIndex: number, maxResults: number = 40): Promise<Book[]> => {
  return searchBooks(query, startIndex, maxResults);
};

export const getMoreBooksByGenre = async (genre: string, startIndex: number, maxResults: number = 40): Promise<Book[]> => {
  return getBooksByGenre(genre, startIndex, maxResults);
};
