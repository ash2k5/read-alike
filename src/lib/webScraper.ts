import { Book } from '@/types';

const cleanText = (html: string): string => {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ') 
    .trim();
};

const fetchWithTimeout = async (url: string, timeout = 5000): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

const scrapeGoodreadsDescription = async (title: string, author?: string): Promise<string> => {
  try {
    const searchQuery = encodeURIComponent(`${title} ${author || ''}`);
    const searchUrl = `https://www.goodreads.com/search?q=${searchQuery}`;
    
    const response = await fetchWithTimeout(searchUrl);
    const html = await response.text();
    
    const descriptionMatch = html.match(/<div class="readable stacked"[\s\S]*?<span[\s\S]*?>(.*?)<\/span>/);
    if (descriptionMatch && descriptionMatch[1]) {
      return cleanText(descriptionMatch[1]);
    }
  } catch (error) {
    console.error('Error scraping Goodreads:', error);
  }
  return '';
};

const scrapeBookDepositoryDescription = async (title: string, author?: string): Promise<string> => {
  try {
    const searchQuery = encodeURIComponent(`${title} ${author || ''}`);
    const searchUrl = `https://www.bookdepository.com/search?searchTerm=${searchQuery}`;
    
    const response = await fetchWithTimeout(searchUrl);
    const html = await response.text();
    
    const descriptionMatch = html.match(/<div class="item-excerpt"[\s\S]*?<p>(.*?)<\/p>/);
    if (descriptionMatch && descriptionMatch[1]) {
      return cleanText(descriptionMatch[1]);
    }
  } catch (error) {
    console.error('Error scraping Book Depository:', error);
  }
  return '';
};

const scrapeBarnesNobleDescription = async (title: string, author?: string): Promise<string> => {
  try {
    const searchQuery = encodeURIComponent(`${title} ${author || ''}`);
    const searchUrl = `https://www.barnesandnoble.com/s/${searchQuery}`;
    
    const response = await fetchWithTimeout(searchUrl);
    const html = await response.text();
    
    const descriptionMatch = html.match(/<div class="product-info-overview"[\s\S]*?<p>(.*?)<\/p>/);
    if (descriptionMatch && descriptionMatch[1]) {
      return cleanText(descriptionMatch[1]);
    }
  } catch (error) {
    console.error('Error scraping Barnes & Noble:', error);
  }
  return '';
};

export const getBookDescription = async (title: string, author?: string): Promise<string> => {
  try {
    const [goodreadsDesc, bookDepoDesc, bnDesc] = await Promise.all([
      scrapeGoodreadsDescription(title, author),
      scrapeBookDepositoryDescription(title, author),
      scrapeBarnesNobleDescription(title, author)
    ]);

    return goodreadsDesc || bookDepoDesc || bnDesc || '';
  } catch (error) {
    console.error('Error getting book description:', error);
    return '';
  }
}; 