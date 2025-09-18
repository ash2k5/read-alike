// Genre mapping and normalization utilities

export const STANDARD_GENRES = [
  // Fiction
  'Fiction',
  'Science Fiction',
  'Fantasy',
  'Mystery',
  'Thriller',
  'Romance',
  'Horror',
  'Adventure',
  'Historical Fiction',
  'Literary Fiction',
  'Contemporary Fiction',
  'Crime',
  'Western',
  'Dystopian',

  // Non-Fiction
  'Non-Fiction',
  'Biography',
  'Autobiography',
  'History',
  'Science',
  'Technology',
  'Business',
  'Self-Help',
  'Health',
  'Travel',
  'Cooking',
  'Art',
  'Philosophy',
  'Religion',
  'Politics',
  'Psychology',
  'Education',
  'Sports',

  // Special Categories
  'Young Adult',
  'Children',
  'Poetry',
  'Drama',
  'Essays',
  'Reference',
  'Textbook',
  'Graphic Novel',
  'Comics'
];

// Map common variations to standard genres
const GENRE_MAPPINGS: Record<string, string> = {
  // Science Fiction variations
  'sci-fi': 'Science Fiction',
  'science-fiction': 'Science Fiction',
  'scifi': 'Science Fiction',
  'sf': 'Science Fiction',
  'speculative fiction': 'Science Fiction',

  // Fantasy variations
  'epic fantasy': 'Fantasy',
  'urban fantasy': 'Fantasy',
  'high fantasy': 'Fantasy',
  'dark fantasy': 'Fantasy',

  // Mystery variations
  'detective': 'Mystery',
  'crime fiction': 'Crime',
  'police procedural': 'Crime',
  'cozy mystery': 'Mystery',
  'hard-boiled': 'Crime',

  // Romance variations
  'romantic fiction': 'Romance',
  'love story': 'Romance',
  'romantic suspense': 'Romance',

  // Horror variations
  'supernatural': 'Horror',
  'gothic': 'Horror',
  'paranormal': 'Horror',

  // Thriller variations
  'suspense': 'Thriller',
  'psychological thriller': 'Thriller',
  'action thriller': 'Thriller',

  // Non-fiction variations
  'nonfiction': 'Non-Fiction',
  'memoir': 'Biography',
  'memoirs': 'Biography',
  'life story': 'Biography',
  'true story': 'Non-Fiction',
  'true crime': 'Crime',

  // History variations
  'historical': 'History',
  'world history': 'History',
  'american history': 'History',

  // Self-help variations
  'self help': 'Self-Help',
  'personal development': 'Self-Help',
  'motivational': 'Self-Help',
  'lifestyle': 'Self-Help',

  // Young Adult variations
  'ya': 'Young Adult',
  'teen': 'Young Adult',
  'teenage': 'Young Adult',
  'young adult fiction': 'Young Adult',

  // Children variations
  'kids': 'Children',
  'juvenile': 'Children',
  'picture book': 'Children',
  'early reader': 'Children',

  // Other common mappings
  'textbooks': 'Textbook',
  'educational': 'Education',
  'academic': 'Reference',
  'essays': 'Essays',
  'philosophy': 'Philosophy',
  'religion': 'Religion',
  'spiritual': 'Religion',
  'cooking': 'Cooking',
  'recipes': 'Cooking',
  'travel': 'Travel',
  'guidebook': 'Travel',
  'art': 'Art',
  'design': 'Art',
  'photography': 'Art',
  'music': 'Art',
  'sports': 'Sports',
  'fitness': 'Health',
  'health': 'Health',
  'medical': 'Health',
  'psychology': 'Psychology',
  'business': 'Business',
  'economics': 'Business',
  'finance': 'Business',
  'technology': 'Technology',
  'computer': 'Technology',
  'programming': 'Technology',
  'science': 'Science',
  'nature': 'Science',
  'environment': 'Science',
  'politics': 'Politics',
  'political science': 'Politics',
  'sociology': 'Politics',
  'graphic novel': 'Graphic Novel',
  'comic': 'Comics',
  'manga': 'Comics'
};

export const normalizeGenre = (genre: string): string => {
  if (!genre) return 'General';

  const normalized = genre.toLowerCase().trim();

  // Check direct mappings first
  if (GENRE_MAPPINGS[normalized]) {
    return GENRE_MAPPINGS[normalized];
  }

  // Check if it's already a standard genre (case-insensitive)
  const standardGenre = STANDARD_GENRES.find(
    g => g.toLowerCase() === normalized
  );

  if (standardGenre) {
    return standardGenre;
  }

  // Try partial matching for compound genres
  for (const [key, value] of Object.entries(GENRE_MAPPINGS)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return value;
    }
  }

  // Check if it contains any standard genre as substring
  for (const standardGenre of STANDARD_GENRES) {
    if (normalized.includes(standardGenre.toLowerCase()) ||
        standardGenre.toLowerCase().includes(normalized)) {
      return standardGenre;
    }
  }

  // If no match found, capitalize the original and return
  return capitalizeGenre(genre);
};

export const normalizeGenres = (genres: string[]): string[] => {
  if (!genres || genres.length === 0) return ['General'];

  const normalized = genres
    .map(normalizeGenre)
    .filter(genre => genre !== 'General') // Remove 'General' unless it's the only one
    .filter((genre, index, arr) => arr.indexOf(genre) === index) // Remove duplicates
    .slice(0, 6); // Limit to 6 genres

  return normalized.length > 0 ? normalized : ['General'];
};

const capitalizeGenre = (genre: string): string => {
  return genre
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Get popular genres for filtering/suggestions
export const getPopularGenres = (): string[] => {
  return [
    'Fiction',
    'Science Fiction',
    'Fantasy',
    'Mystery',
    'Romance',
    'Thriller',
    'Non-Fiction',
    'Biography',
    'History',
    'Self-Help',
    'Young Adult',
    'Children',
    'Business',
    'Science',
    'Health'
  ];
};

// Get genre color for UI
export const getGenreColor = (genre: string): string => {
  const colors: Record<string, string> = {
    'Fiction': 'bg-blue-100 text-blue-800',
    'Science Fiction': 'bg-purple-100 text-purple-800',
    'Fantasy': 'bg-pink-100 text-pink-800',
    'Mystery': 'bg-gray-100 text-gray-800',
    'Romance': 'bg-red-100 text-red-800',
    'Thriller': 'bg-orange-100 text-orange-800',
    'Horror': 'bg-red-200 text-red-900',
    'Non-Fiction': 'bg-green-100 text-green-800',
    'Biography': 'bg-yellow-100 text-yellow-800',
    'History': 'bg-amber-100 text-amber-800',
    'Self-Help': 'bg-emerald-100 text-emerald-800',
    'Young Adult': 'bg-indigo-100 text-indigo-800',
    'Children': 'bg-cyan-100 text-cyan-800',
    'Business': 'bg-slate-100 text-slate-800',
    'Science': 'bg-teal-100 text-teal-800',
  };

  return colors[genre] || 'bg-gray-100 text-gray-700';
};