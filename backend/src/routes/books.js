const express = require('express');
const axios = require('axios');
const NodeCache = require('node-cache');
const { query } = require('../db/database');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Cache for 30 minutes
const cache = new NodeCache({ stdTTL: 1800 });

// Enhanced Open Library integration
const searchOpenLibrary = async (searchQuery, limit = 20) => {
  try {
    const cacheKey = `search:${searchQuery}:${limit}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    const params = new URLSearchParams({
      q: searchQuery,
      limit: Math.min(limit * 2, 100),
      fields: 'key,title,author_name,first_publish_year,isbn,cover_i,subject,publisher,language,ratings_average,ratings_count',
      sort: 'rating desc'
    });

    const response = await axios.get(`https://openlibrary.org/search.json?${params}`);
    const books = response.data.docs
      .filter(doc =>
        doc.title &&
        doc.author_name &&
        doc.first_publish_year &&
        doc.first_publish_year > 1800
      )
      .slice(0, limit)
      .map(doc => ({
        id: doc.key.replace('/works/', ''),
        title: doc.title,
        author: doc.author_name[0],
        cover: doc.cover_i
          ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`
          : null,
        description: 'Loading description...',
        genre: normalizeGenres(doc.subject || []),
        rating: doc.ratings_average || 0,
        year: doc.first_publish_year || 0,
        amazonLink: generateAmazonLink(doc.title, doc.author_name?.[0])
      }));

    // Cache books individually
    for (const book of books) {
      await cacheBook(book);
    }

    cache.set(cacheKey, books);
    return books;

  } catch (error) {
    console.error('OpenLibrary search error:', error);
    return [];
  }
};

const normalizeGenres = (subjects) => {
  const genreMap = {
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
    'science': 'Science',
    'business': 'Business',
    'self-help': 'Self-Help'
  };

  return subjects
    .slice(0, 5)
    .map(subject => {
      const normalized = subject.toLowerCase().trim();
      return genreMap[normalized] ||
        subject.split(' ').map(word =>
          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');
    })
    .filter((genre, index, arr) => arr.indexOf(genre) === index);
};

const generateAmazonLink = (title, author) => {
  const searchQuery = encodeURIComponent(`${title} ${author || ''}`);
  return `https://www.amazon.com/s?k=${searchQuery}&i=stripbooks`;
};

const cacheBook = async (book) => {
  try {
    await query(`
      INSERT INTO book_cache (book_id, title, author, cover_url, description, genres, rating, year, amazon_link)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (book_id) DO UPDATE SET
        title = EXCLUDED.title,
        author = EXCLUDED.author,
        cover_url = EXCLUDED.cover_url,
        description = EXCLUDED.description,
        genres = EXCLUDED.genres,
        rating = EXCLUDED.rating,
        year = EXCLUDED.year,
        amazon_link = EXCLUDED.amazon_link,
        cached_at = CURRENT_TIMESTAMP
    `, [
      book.id,
      book.title,
      book.author,
      book.cover,
      book.description,
      book.genre,
      book.rating,
      book.year,
      book.amazonLink
    ]);
  } catch (error) {
    console.error('Cache book error:', error);
  }
};

// Routes

// Search books
router.get('/search', optionalAuth, async (req, res) => {
  try {
    const { q: query, limit = 20 } = req.query;

    if (!query || query.length < 2) {
      return res.status(400).json({ error: 'Query must be at least 2 characters' });
    }

    const books = await searchOpenLibrary(query, parseInt(limit));

    res.json({
      books,
      total: books.length,
      query
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Get trending books
router.get('/trending', optionalAuth, async (req, res) => {
  try {
    const { limit = 16 } = req.query;
    const cacheKey = `trending:${limit}`;

    let books = cache.get(cacheKey);
    if (!books) {
      const trendingQueries = [
        'bestseller 2024',
        'award winning fiction',
        'popular romance',
        'trending science fiction'
      ];

      const allBooks = [];
      for (const query of trendingQueries) {
        const results = await searchOpenLibrary(query, Math.ceil(limit / trendingQueries.length));
        allBooks.push(...results);
      }

      // Remove duplicates and sort by rating
      const uniqueBooks = allBooks.filter((book, index, arr) =>
        arr.findIndex(b => b.id === book.id) === index
      );

      books = uniqueBooks
        .sort((a, b) => b.rating - a.rating)
        .slice(0, parseInt(limit));

      cache.set(cacheKey, books, 3600); // Cache for 1 hour
    }

    res.json({ books });

  } catch (error) {
    console.error('Trending books error:', error);
    res.status(500).json({ error: 'Failed to get trending books' });
  }
});

// Get book by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `book:${id}`;

    let book = cache.get(cacheKey);
    if (!book) {
      // Try database cache first
      const dbResult = await query('SELECT * FROM book_cache WHERE book_id = $1', [id]);

      if (dbResult.rows.length > 0) {
        const cached = dbResult.rows[0];
        book = {
          id: cached.book_id,
          title: cached.title,
          author: cached.author,
          cover: cached.cover_url,
          description: cached.description,
          genre: cached.genres,
          rating: parseFloat(cached.rating) || 0,
          year: cached.year,
          amazonLink: cached.amazon_link
        };
      } else {
        // Fetch from Open Library
        try {
          const response = await axios.get(`https://openlibrary.org/works/${id}.json`);
          const work = response.data;

          book = {
            id,
            title: work.title,
            author: 'Unknown Author',
            cover: work.covers?.[0]
              ? `https://covers.openlibrary.org/b/id/${work.covers[0]}-L.jpg`
              : null,
            description: typeof work.description === 'string'
              ? work.description
              : work.description?.value || 'No description available',
            genre: normalizeGenres(work.subjects || []),
            rating: 0,
            year: 0,
            amazonLink: generateAmazonLink(work.title)
          };

          await cacheBook(book);
        } catch (apiError) {
          return res.status(404).json({ error: 'Book not found' });
        }
      }

      cache.set(cacheKey, book, 3600);
    }

    res.json({ book });

  } catch (error) {
    console.error('Get book error:', error);
    res.status(500).json({ error: 'Failed to get book' });
  }
});

module.exports = router;