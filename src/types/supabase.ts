
export type UserProfile = {
  id: string;
  email: string;
  username: string;
  avatar_url?: string;
  favorite_genres?: string[];
  created_at: string;
};

export type BookList = {
  id: string;
  user_id: string;
  book_id: string;
  status: 'reading' | 'want_to_read' | 'completed';
  created_at: string;
};

export type UserReview = {
  id: string;
  user_id: string;
  book_id: string;
  rating: number;
  review_text: string;
  created_at: string;
};

export type UserPreferences = {
  id: string;
  user_id: string;
  favorite_genres: string[];
  email_notifications: boolean;
  theme: 'light' | 'dark';
  created_at: string;
};
