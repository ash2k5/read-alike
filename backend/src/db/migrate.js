const { query } = require('./database');

const createTables = async () => {
  try {
    console.log('Starting database migration...');

    // Users table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // User books table
    await query(`
      CREATE TABLE IF NOT EXISTS user_books (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        book_id VARCHAR(255) NOT NULL,
        book_title VARCHAR(500) NOT NULL,
        book_author VARCHAR(255) NOT NULL,
        book_cover TEXT,
        book_description TEXT,
        book_genres TEXT[],
        status VARCHAR(20) CHECK (status IN ('want_to_read', 'reading', 'read')) NOT NULL,
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        review TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, book_id)
      )
    `);

    // User preferences table
    await query(`
      CREATE TABLE IF NOT EXISTS user_preferences (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
        favorite_genres TEXT[],
        favorite_authors TEXT[],
        reading_goals JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Book cache table (for performance)
    await query(`
      CREATE TABLE IF NOT EXISTS book_cache (
        id SERIAL PRIMARY KEY,
        book_id VARCHAR(255) UNIQUE NOT NULL,
        title VARCHAR(500) NOT NULL,
        author VARCHAR(255) NOT NULL,
        cover_url TEXT,
        description TEXT,
        genres TEXT[],
        rating DECIMAL(3,2),
        year INTEGER,
        amazon_link TEXT,
        cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for performance
    await query(`
      CREATE INDEX IF NOT EXISTS idx_user_books_user_id ON user_books(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_books_status ON user_books(status);
      CREATE INDEX IF NOT EXISTS idx_user_books_rating ON user_books(rating);
      CREATE INDEX IF NOT EXISTS idx_book_cache_book_id ON book_cache(book_id);
      CREATE INDEX IF NOT EXISTS idx_book_cache_genres ON book_cache USING GIN(genres);
    `);

    // Create updated_at trigger function
    await query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // Create triggers for updated_at
    await query(`
      DROP TRIGGER IF EXISTS update_users_updated_at ON users;
      CREATE TRIGGER update_users_updated_at
        BEFORE UPDATE ON users
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      DROP TRIGGER IF EXISTS update_user_books_updated_at ON user_books;
      CREATE TRIGGER update_user_books_updated_at
        BEFORE UPDATE ON user_books
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;
      CREATE TRIGGER update_user_preferences_updated_at
        BEFORE UPDATE ON user_preferences
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    console.log('Database migration completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

// Run migration if called directly
if (require.main === module) {
  createTables();
}

module.exports = { createTables };