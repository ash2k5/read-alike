
export interface Book {
  id: string;
  title: string;
  author: string;
  cover: string;
  description: string;
  genre: Genre[];
  rating: number;
  year: number;
  reviews: Review[];
  amazonLink: string;
}

export interface Genre {
  id: string;
  name: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  text: string;
  rating: number;
  date: string;
}

export interface User {
  id: string;
  name: string;
  avatar?: string;
  favoriteGenres: string[];
  bookList: string[];
}
