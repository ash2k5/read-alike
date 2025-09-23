
const OPEN_LIBRARY_API = 'https://openlibrary.org';
const OPEN_LIBRARY_COVERS = 'https://covers.openlibrary.org/b';

export interface OpenLibraryBook {
  key: string;
  title: string;
  authors?: Array<{ name: string }>;
  first_publish_year?: number;
  subject?: string[];
  publishers?: string[];
  isbn?: string[];
  cover_i?: number;
  edition_count?: number;
  first_sentence?: string[];
}

export const searchOpenLibrary = async (query: string, limit: number = 20): Promise<OpenLibraryBook[]> => {
  try {
    const url = `${OPEN_LIBRARY_API}/search.json?q=${encodeURIComponent(query)}&limit=${limit}&fields=key,title,author_name,first_publish_year,subject,publisher,isbn,cover_i,edition_count,first_sentence`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Open Library API error: ${response.status}`);
    }

    const data = await response.json();
    return data.docs || [];
  } catch (error) {
    console.error('Error fetching from Open Library:', error);
    return [];
  }
};

export const getOpenLibraryBookByISBN = async (isbn: string): Promise<OpenLibraryBook | null> => {
  try {
    const url = `${OPEN_LIBRARY_API}/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`;

    const response = await fetch(url);
    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const bookData = data[`ISBN:${isbn}`];

    if (!bookData) return null;

    return {
      key: bookData.key || '',
      title: bookData.title || '',
      authors: bookData.authors || [],
      first_publish_year: bookData.publish_date ? new Date(bookData.publish_date).getFullYear() : undefined,
      subject: bookData.subjects?.map((s: any) => s.name) || [],
      publishers: bookData.publishers?.map((p: any) => p.name) || [],
      isbn: [isbn],
      cover_i: bookData.cover?.large ? parseInt(bookData.cover.large.split('/').pop()?.split('-')[0] || '0') : undefined,
    };
  } catch (error) {
    console.error('Error fetching book by ISBN from Open Library:', error);
    return null;
  }
};

export const getOpenLibraryCover = (coverId: number, size: 'S' | 'M' | 'L' = 'L'): string => {
  return `${OPEN_LIBRARY_COVERS}/id/${coverId}-${size}.jpg`;
};

export const getOpenLibraryCoverByISBN = (isbn: string, size: 'S' | 'M' | 'L' = 'L'): string => {
  return `${OPEN_LIBRARY_COVERS}/isbn/${isbn}-${size}.jpg`;
};