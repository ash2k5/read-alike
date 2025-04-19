import { Book, Genre } from '@/types';
import * as cheerio from 'cheerio';

const generateAmazonLink = (title: string, author?: string): string => {
  const searchQuery = encodeURIComponent(`${title} ${author || ''}`);
  return `https://www.amazon.com/s?k=${searchQuery}&i=stripbooks`;
};

export const scrapeAmazonBookData = async (title: string, author?: string): Promise<Partial<Book>> => {
  try {
    const searchQuery = encodeURIComponent(`${title} ${author || ''}`);
    const amazonUrl = `https://www.amazon.com/s?k=${searchQuery}&i=stripbooks`;

    const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(amazonUrl)}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch from CORS proxy: ${response.status}`);
    }

    const data = await response.json();
    if (!data.contents) {
      throw new Error('No content received from CORS proxy');
    }

    const $ = cheerio.load(data.contents);
    const firstResult = $('[data-component-type="s-search-result"]').first();
    if (!firstResult.length) return {};

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
    const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(amazonUrl)}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch from CORS proxy: ${response.status}`);
    }

    const data = await response.json();
    if (!data.contents) {
      throw new Error('No content received from CORS proxy');
    }

    const $ = cheerio.load(data.contents);
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