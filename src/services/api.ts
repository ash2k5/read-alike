const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Auth endpoints
  async register(email: string, password: string, name?: string) {
    return this.request<{
      message: string;
      user: User;
      token: string;
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  async login(email: string, password: string) {
    return this.request<{
      message: string;
      user: User;
      token: string;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getCurrentUser() {
    return this.request<{ user: User }>('/auth/me');
  }

  async updateProfile(name: string) {
    return this.request<{
      message: string;
      user: User;
    }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify({ name }),
    });
  }

  // Books endpoints
  async searchBooks(query: string, limit = 20) {
    const params = new URLSearchParams({ q: query, limit: limit.toString() });
    return this.request<{
      books: Book[];
      total: number;
      query: string;
    }>(`/books/search?${params}`);
  }

  async getTrendingBooks(limit = 16) {
    const params = new URLSearchParams({ limit: limit.toString() });
    return this.request<{ books: Book[] }>(`/books/trending?${params}`);
  }

  async getBookById(id: string) {
    return this.request<{ book: Book }>(`/books/${id}`);
  }

  // User books endpoints
  async getUserBooks(status?: string) {
    const params = status ? new URLSearchParams({ status }) : '';
    return this.request<{ books: UserBook[] }>(`/users/books?${params}`);
  }

  async addBookToLibrary(book: {
    bookId: string;
    title: string;
    author: string;
    cover?: string;
    description?: string;
    genres?: string[];
    status: string;
    rating?: number;
    review?: string;
  }) {
    return this.request<{
      message: string;
      book: UserBook;
    }>('/users/books', {
      method: 'POST',
      body: JSON.stringify(book),
    });
  }

  async updateBookInLibrary(
    bookId: string,
    updates: {
      status?: string;
      rating?: number;
      review?: string;
    }
  ) {
    return this.request<{
      message: string;
      book: UserBook;
    }>(`/users/books/${bookId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async removeBookFromLibrary(bookId: string) {
    return this.request<{ message: string }>(`/users/books/${bookId}`, {
      method: 'DELETE',
    });
  }

  async getUserStats() {
    return this.request<{
      stats: {
        want_to_read: number;
        reading: number;
        read: number;
        average_rating: number;
      };
    }>('/users/stats');
  }

  // Recommendations endpoint
  async getRecommendations(limit = 8) {
    const params = new URLSearchParams({ limit: limit.toString() });
    return this.request<{
      recommendations: Array<{
        book: Book;
        score: number;
        reasons: string[];
      }>;
      personalized: boolean;
      based_on: number | string;
    }>(`/recommendations?${params}`);
  }
}

// Types
export interface User {
  id: number;
  email: string;
  name: string;
  created_at: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  cover: string | null;
  description: string;
  genre: string[];
  rating: number;
  year: number;
  amazonLink: string;
}

export interface UserBook {
  id: number;
  bookId: string;
  title: string;
  author: string;
  cover: string | null;
  description: string;
  genres: string[];
  status: 'want_to_read' | 'reading' | 'read';
  rating: number | null;
  review: string | null;
  createdAt: string;
  updatedAt: string;
}

// Create and export the API client instance
export const apiClient = new ApiClient(API_BASE_URL);

// Helper functions for token management
export const setAuthToken = (token: string) => {
  localStorage.setItem('auth_token', token);
};

export const getAuthToken = () => {
  return localStorage.getItem('auth_token');
};

export const removeAuthToken = () => {
  localStorage.removeItem('auth_token');
};