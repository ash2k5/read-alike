const express = require('express');
const { query } = require('../db/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get user's books
router.get('/books', authenticateToken, async (req, res) => {
  try {
    const { status } = req.query;
    const userId = req.user.userId;

    let queryText = `
      SELECT
        id, book_id, book_title, book_author, book_cover, book_description,
        book_genres, status, rating, review, created_at, updated_at
      FROM user_books
      WHERE user_id = $1
    `;
    const params = [userId];

    if (status) {
      queryText += ' AND status = $2';
      params.push(status);
    }

    queryText += ' ORDER BY updated_at DESC';

    const result = await query(queryText, params);

    const books = result.rows.map(row => ({
      id: row.id,
      bookId: row.book_id,
      title: row.book_title,
      author: row.book_author,
      cover: row.book_cover,
      description: row.book_description,
      genres: row.book_genres || [],
      status: row.status,
      rating: row.rating,
      review: row.review,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    res.json({ books });

  } catch (error) {
    console.error('Get user books error:', error);
    res.status(500).json({ error: 'Failed to get books' });
  }
});

// Add book to user's library
router.post('/books', authenticateToken, async (req, res) => {
  try {
    const {
      bookId, title, author, cover, description, genres, status, rating, review
    } = req.body;
    const userId = req.user.userId;

    // Validation
    if (!bookId || !title || !author || !status) {
      return res.status(400).json({
        error: 'bookId, title, author, and status are required'
      });
    }

    if (!['want_to_read', 'reading', 'read'].includes(status)) {
      return res.status(400).json({
        error: 'Status must be want_to_read, reading, or read'
      });
    }

    const result = await query(`
      INSERT INTO user_books (
        user_id, book_id, book_title, book_author, book_cover,
        book_description, book_genres, status, rating, review
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [
      userId, bookId, title, author, cover || null,
      description || '', genres || [], status,
      rating || null, review || null
    ]);

    const book = result.rows[0];

    res.status(201).json({
      message: 'Book added to library',
      book: {
        id: book.id,
        bookId: book.book_id,
        title: book.book_title,
        author: book.book_author,
        cover: book.book_cover,
        description: book.book_description,
        genres: book.book_genres || [],
        status: book.status,
        rating: book.rating,
        review: book.review,
        createdAt: book.created_at,
        updatedAt: book.updated_at
      }
    });

  } catch (error) {
    if (error.code === '23505') { // Unique constraint violation
      return res.status(409).json({ error: 'Book already in library' });
    }
    console.error('Add book error:', error);
    res.status(500).json({ error: 'Failed to add book' });
  }
});

// Update book in user's library
router.put('/books/:bookId', authenticateToken, async (req, res) => {
  try {
    const { bookId } = req.params;
    const { status, rating, review } = req.body;
    const userId = req.user.userId;

    if (status && !['want_to_read', 'reading', 'read'].includes(status)) {
      return res.status(400).json({
        error: 'Status must be want_to_read, reading, or read'
      });
    }

    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        error: 'Rating must be between 1 and 5'
      });
    }

    const updateFields = [];
    const values = [userId, bookId];

    if (status !== undefined) {
      updateFields.push(`status = $${values.length + 1}`);
      values.push(status);
    }

    if (rating !== undefined) {
      updateFields.push(`rating = $${values.length + 1}`);
      values.push(rating);
    }

    if (review !== undefined) {
      updateFields.push(`review = $${values.length + 1}`);
      values.push(review);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const result = await query(`
      UPDATE user_books
      SET ${updateFields.join(', ')}
      WHERE user_id = $1 AND book_id = $2
      RETURNING *
    `, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Book not found in library' });
    }

    const book = result.rows[0];

    res.json({
      message: 'Book updated successfully',
      book: {
        id: book.id,
        bookId: book.book_id,
        title: book.book_title,
        author: book.book_author,
        cover: book.book_cover,
        description: book.book_description,
        genres: book.book_genres || [],
        status: book.status,
        rating: book.rating,
        review: book.review,
        createdAt: book.created_at,
        updatedAt: book.updated_at
      }
    });

  } catch (error) {
    console.error('Update book error:', error);
    res.status(500).json({ error: 'Failed to update book' });
  }
});

// Remove book from user's library
router.delete('/books/:bookId', authenticateToken, async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = req.user.userId;

    const result = await query(
      'DELETE FROM user_books WHERE user_id = $1 AND book_id = $2 RETURNING *',
      [userId, bookId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Book not found in library' });
    }

    res.json({ message: 'Book removed from library' });

  } catch (error) {
    console.error('Remove book error:', error);
    res.status(500).json({ error: 'Failed to remove book' });
  }
});

// Get user statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await query(`
      SELECT
        status,
        COUNT(*) as count,
        AVG(rating) as avg_rating
      FROM user_books
      WHERE user_id = $1
      GROUP BY status
    `, [userId]);

    const stats = {
      want_to_read: 0,
      reading: 0,
      read: 0,
      average_rating: 0
    };

    result.rows.forEach(row => {
      stats[row.status] = parseInt(row.count);
      if (row.status === 'read' && row.avg_rating) {
        stats.average_rating = parseFloat(row.avg_rating);
      }
    });

    res.json({ stats });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
});

module.exports = router;