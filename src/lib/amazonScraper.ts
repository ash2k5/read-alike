import { Book, Genre } from '@/types';
import * as cheerio from 'cheerio';

const generateAmazonLink = (title: string, author?: string): string => {
  const searchQuery = encodeURIComponent(`${title} ${author || ''}`);
  return `https://www.amazon.com/s?k=${searchQuery}&i=stripbooks`;
};

const fetchWithProxy = async (url: string): Promise<string> => {
  try {
    // Try multiple CORS proxies
    const proxies = [
      `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
      `https://cors-anywhere.herokuapp.com/${url}`,
      `https://api.codetabs.com/v1/proxy?quest=${url}`
    ];

    for (const proxyUrl of proxies) {
      try {
        const response = await fetch(proxyUrl, {
          headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        });

        if (response.ok) {
          const data = await response.json();
          return data.contents || data;
        }
      } catch (error) {
        console.warn(`Proxy ${proxyUrl} failed, trying next...`);
        continue;
      }
    }

    throw new Error('All proxies failed');
  } catch (error) {
    console.error('Error fetching with proxy:', error);
    throw error;
  }
};

export const scrapeAmazonBookData = async (title: string, author?: string): Promise<Partial<Book>> => {
  try {
    const searchQuery = encodeURIComponent(`${title} ${author || ''}`);
    const amazonUrl = `https://www.amazon.com/s?k=${searchQuery}&i=stripbooks`;

    const html = await fetchWithProxy(amazonUrl);
    const $ = cheerio.load(html);

    const firstResult = $('[data-component-type="s-search-result"]').first();
    if (!firstResult.length) {
      console.log('No search results found on Amazon');
      return {};
    }

    const titleElement = firstResult.find('h2 a');
    const authorElement = firstResult.find('.a-color-secondary .a-size-base+ .a-size-base');
    const ratingElement = firstResult.find('.a-icon-star-small .a-icon-alt');
    const imageElement = firstResult.find('img.s-image');
    const priceElement = firstResult.find('.a-price .a-offscreen');

    const scrapedData: Partial<Book> = {
      title: titleElement.text().trim() || title,
      author: authorElement.text().trim() || author || 'Unknown Author',
      cover: imageElement.attr('src') || '',
      rating: ratingElement.length ? parseFloat(ratingElement.text().split(' ')[0] || '0') : 0,
      amazonLink: titleElement.attr('href') ? `https://www.amazon.com${titleElement.attr('href')}` : generateAmazonLink(title, author)
    };

    return scrapedData;
  } catch (error) {
    console.error('Error scraping Amazon data:', error);
    return {};
  }
};

export const scrapeAmazonBookDetails = async (amazonUrl: string): Promise<Partial<Book>> => {
  try {
    const html = await fetchWithProxy(amazonUrl);
    const $ = cheerio.load(html);

    const descriptionElement = $('#bookDescription_feature_div');
    const genreElements = $('#wayfinding-breadcrumbs_feature_div li:not(:first-child) a');
    const yearElement = $('#titleDetails_feature_div .a-text-bold:contains("Publication date") + span');

    const genres: Genre[] = genreElements.map((index, el) => {
      const text = $(el).text().trim();
      return {
        id: `genre-${index}-${text.toLowerCase().replace(/\s+/g, '-')}`,
        name: text || 'Uncategorized'
      };
    }).get();

    const scrapedData: Partial<Book> = {
      description: descriptionElement.text().trim() || '',
      genre: genres,
      year: yearElement.length ? new Date(yearElement.text().trim()).getFullYear() : 0
    };

    return scrapedData;
  } catch (error) {
    console.error('Error scraping Amazon details:', error);
    return {};
  }
}; 