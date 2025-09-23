# ReadAlike - Book Recommendation Platform

A modern book recommendation platform built with React, TypeScript, and Supabase.

## Live Demo

- Frontend: [Deployed on Vercel](https://your-app.vercel.app)
- Backend API: [Deployed on Railway](https://your-backend.railway.app)

## Features

- Book Search: Search millions of books with instant results
- User Authentication: Secure authentication system
- Personal Library: Track reading progress (Want to Read, Reading, Completed)
- Rating System: Rate and review books
- Smart Recommendations: Content-based book suggestions using TF-IDF similarity
- Reading Statistics: Track reading goals and progress
- Performance Optimized: Client-side caching and modern architecture

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for development and build
- Tailwind CSS for styling
- TanStack Query for data fetching and caching
- React Router for navigation

### Backend & Database
- Supabase for backend services
- PostgreSQL database
- Real-time subscriptions
- Row Level Security (RLS)

### APIs
- Google Books API integration
- Open Library API integration

## Getting Started

### Prerequisites
- Node.js 18+
- Supabase account

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/read-alike.git
   cd read-alike
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Setup environment variables
   ```bash
   cp .env.example .env.local
   ```

4. Configure environment variables in `.env.local`
   ```env
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   VITE_GOOGLE_BOOKS_API_KEY=your-google-books-api-key
   ```

5. Start the development server
   ```bash
   npm run dev
   ```

## Deployment

### Vercel Deployment

1. Connect your repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

## Database Schema

The application uses Supabase with the following main tables:

- `user_profiles`: User information and preferences
- `user_books`: User's book library with status and ratings

## Architecture

```
Frontend (React/Vite) ←→ Supabase (Database + Auth) ←→ External APIs (Google Books, Open Library)
```

## Key Features Implementation

- **Authentication**: Supabase Auth with user profiles
- **Book Search**: Integrated Google Books and Open Library APIs
- **Recommendations**: TF-IDF based content similarity algorithm
- **Caching**: Client-side caching with TanStack Query
- **Real-time Updates**: Supabase real-time subscriptions