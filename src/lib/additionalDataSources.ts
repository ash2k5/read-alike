import { Book, Genre } from '@/types';
import { cacheManager } from './cacheManager';

const LOC_API_URL = 'https://www.loc.gov/books';

const OPEN_LIBRARY_API_URL = 'https://openlibrary.org/api/books';

const fetchFromLibraryOfCongress = async (title: string, author?: string): Promise<Partial<Book>> => {
  const cacheKey = `loc-${title}-${author}`;
  return cacheManager.get(cacheKey, async () => {
    try {
      const response = await fetch(
        `${LOC_API_URL}?q=${encodeURIComponent(title)}${author ? `+${encodeURIComponent(author)}` : ''}&fo=json`
      );
      const data = await response.json();
      
      if (!data.results || data.results.length === 0) return {};

      const firstResult = data.results[0];
      return {
        title: firstResult.title || title,
        author: firstResult.author || author || 'Unknown Author',
        year: firstResult.date ? new Date(firstResult.date).getFullYear() : 0,
        description: firstResult.description || '',
        genre: firstResult.subjects?.map((subject: string, index: number) => ({
          id: `genre-${index}-${subject.toLowerCase().replace(/\s+/g, '-')}`,
          name: subject
        })) || []
      };
    } catch (error) {
      console.error('Error fetching from Library of Congress:', error);
      return {};
    }
  });
};

const fetchFromOpenLibrary = async (isbn: string): Promise<Partial<Book>> => {
  const cacheKey = `ol-${isbn}`;
  return cacheManager.get(cacheKey, async () => {
    try {
      const response = await fetch(`${OPEN_LIBRARY_API_URL}?bibkeys=ISBN:${isbn}&format=json&jscmd=data`);
      const data = await response.json();
      const bookData = data[`ISBN:${isbn}`];

      if (!bookData) return {};

      return {
        title: bookData.title || '',
        author: bookData.authors?.map((a: any) => a.name).join(', ') || '',
        cover: bookData.cover?.large || bookData.cover?.medium || bookData.cover?.small || '',
        description: bookData.description || '',
        genre: bookData.subjects?.map((subject: any, index: number) => ({
          id: `genre-${index}-${subject.name.toLowerCase().replace(/\s+/g, '-')}`,
          name: subject.name
        })) || []
      };
    } catch (error) {
      console.error('Error fetching from Open Library:', error);
      return {};
    }
  });
};

export const getAdditionalBookData = async (
  title: string,
  author?: string,
  isbn?: string
): Promise<Partial<Book>> => {
  const results: Partial<Book>[] = [];

  const locData = await fetchFromLibraryOfCongress(title, author);
  if (Object.keys(locData).length > 0) results.push(locData);

  if (isbn) {
    const olData = await fetchFromOpenLibrary(isbn);
    if (Object.keys(olData).length > 0) results.push(olData);
  }

  return results.reduce((merged, current) => ({
    ...merged,
    ...current,
    genre: [...(merged.genre || []), ...(current.genre || [])]
      .filter((g, i, self) => i === self.findIndex(gg => gg.id === g.id))
  }), {});
}; 