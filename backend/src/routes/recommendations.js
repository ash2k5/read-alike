const express = require('express');
const { query } = require('../db/database');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const axios = require('axios');

const router = express.Router();

// Generate recommendations for user
router.get('/', optionalAuth, async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { limit = 8 } = req.query;

    if (!userId) {
      // Return trending books for non-authenticated users
      return getTrendingRecommendations(res, parseInt(limit));
    }

    // Get user's reading history
    const userBooksResult = await query(`
      SELECT book_id, book_title, book_author, book_genres, status, rating
      FROM user_books
      WHERE user_id = $1
    `, [userId]);

    const userBooks = userBooksResult.rows;

    if (userBooks.length === 0) {
      return getTrendingRecommendations(res, parseInt(limit));
    }

    // Generate personalized recommendations
    const recommendations = await generatePersonalizedRecommendations(userBooks, parseInt(limit));

    res.json({
      recommendations,
      personalized: true,
      based_on: userBooks.length
    });

  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

const getTrendingRecommendations = async (res, limit) => {
  try {
    const trendingQueries = [
      'bestseller fiction',
      'award winning books',
      'popular science fiction',
      'trending romance'
    ];

    const allBooks = [];
    for (const searchQuery of trendingQueries) {
      const books = await searchBooksForRecommendations(searchQuery, Math.ceil(limit / 2));
      allBooks.push(...books);
    }

    // Remove duplicates and format
    const uniqueBooks = allBooks.filter((book, index, arr) =>
      arr.findIndex(b => b.id === book.id) === index
    );

    const recommendations = uniqueBooks
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit)
      .map(book => ({
        book,
        score: Math.random() * 0.3 + 0.7, // Random score between 0.7-1.0
        reasons: ['Popular choice', 'Highly rated']
      }));

    res.json({
      recommendations,
      personalized: false,
      based_on: 'trending'
    });

  } catch (error) {
    console.error('Trending recommendations error:', error);
    res.status(500).json({ error: 'Failed to get trending recommendations' });
  }
};

const generatePersonalizedRecommendations = async (userBooks, limit) => {
  const readBooks = userBooks.filter(book => book.status === 'read');
  const likedBooks = readBooks.filter(book => (book.rating || 0) >= 4);

  // Extract user preferences
  const favoriteGenres = extractFavoriteGenres(likedBooks);
  const favoriteAuthors = extractFavoriteAuthors(likedBooks);

  const userBookIds = new Set(userBooks.map(book => book.book_id));
  const allCandidates = [];

  // Search by favorite authors
  for (const author of favoriteAuthors.slice(0, 2)) {
    const books = await searchBooksForRecommendations(author, 10);
    allCandidates.push(...books.map(book => ({
      ...book,
      reason: `By ${author}, your favorite author`,
      score: 0.9
    })));
  }

  // Search by favorite genres
  for (const genre of favoriteGenres.slice(0, 3)) {
    const books = await searchBooksForRecommendations(`${genre} fiction`, 8);
    allCandidates.push(...books.map(book => ({
      ...book,
      reason: `${genre} genre you enjoy`,
      score: 0.8
    })));
  }

  // Add some trending books for variety
  const trending = await searchBooksForRecommendations('bestseller 2024', 10);
  allCandidates.push(...trending.map(book => ({
    ...book,
    reason: 'Popular choice',
    score: 0.6
  })));

  // Filter out books user already has
  const candidates = allCandidates.filter(book => !userBookIds.has(book.id));

  // Remove duplicates and score
  const uniqueCandidates = candidates.filter((book, index, arr) =>
    arr.findIndex(b => b.id === book.id) === index
  );

  // Score and sort
  const scoredRecommendations = uniqueCandidates.map(candidate => {
    let score = candidate.score || 0.5;
    const reasons = [candidate.reason];

    // Boost score for highly rated books
    if (candidate.rating >= 4.0) {
      score += 0.2;
      reasons.push('Highly rated');
    }

    // Boost for recent books
    if (candidate.year >= 2020) {
      score += 0.1;
      reasons.push('Recent publication');
    }

    // Genre matching bonus
    const bookGenres = candidate.genre || [];
    const genreMatch = bookGenres.some(g => favoriteGenres.includes(g));
    if (genreMatch) {
      score += 0.3;
      reasons.push('Matches your favorite genres');
    }

    return {
      book: {
        id: candidate.id,
        title: candidate.title,
        author: candidate.author,
        cover: candidate.cover,
        description: candidate.description,
        genre: candidate.genre,
        rating: candidate.rating,
        year: candidate.year,
        amazonLink: candidate.amazonLink
      },
      score: Math.min(score, 1.0),
      reasons: [...new Set(reasons)] // Remove duplicate reasons
    };
  });

  return scoredRecommendations
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
};

const extractFavoriteGenres = (likedBooks) => {
  const genreCounts = {};

  likedBooks.forEach(book => {
    const genres = book.book_genres || [];
    genres.forEach(genre => {
      genreCounts[genre] = (genreCounts[genre] || 0) + 1;
    });
  });

  return Object.entries(genreCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([genre]) => genre);
};

const extractFavoriteAuthors = (likedBooks) => {
  const authorCounts = {};

  likedBooks.forEach(book => {
    const author = book.book_author;
    if (author) {
      authorCounts[author] = (authorCounts[author] || 0) + 1;
    }
  });

  return Object.entries(authorCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([author]) => author);
};

const searchBooksForRecommendations = async (searchQuery, limit = 10) => {
  try {
    const params = new URLSearchParams({
      q: searchQuery,
      limit: limit,
      fields: 'key,title,author_name,first_publish_year,isbn,cover_i,subject,ratings_average'
    });

    const response = await axios.get(`https://openlibrary.org/search.json?${params}`);

    return response.data.docs
      .filter(doc =>
        doc.title &&
        doc.author_name &&
        doc.first_publish_year &&
        doc.first_publish_year > 1900
      )
      .map(doc => ({
        id: doc.key.replace('/works/', ''),
        title: doc.title,
        author: doc.author_name[0],
        cover: doc.cover_i
          ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`
          : null,
        description: 'An engaging book you might enjoy',
        genre: normalizeGenres(doc.subject || []),
        rating: doc.ratings_average || 0,
        year: doc.first_publish_year || 0,
        amazonLink: generateAmazonLink(doc.title, doc.author_name?.[0])
      }));

  } catch (error) {
    console.error('Search for recommendations error:', error);
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
    'biography': 'Biography'
  };

  return subjects
    .slice(0, 3)
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

module.exports = router;