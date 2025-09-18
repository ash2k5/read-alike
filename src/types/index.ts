export interface Book {
  id: string;
  title: string;
  author: string;
  cover: string;
  description: string;
  genre: string[];
  rating: number;
  year: number;
  amazonLink?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}