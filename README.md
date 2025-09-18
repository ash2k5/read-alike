# ReadAlike - Book Recommendation Platform

A modern, full-stack book recommendation platform built with React, TypeScript, Node.js, and PostgreSQL.

## 🚀 Live Demo

- **Frontend**: [Deployed on Vercel](https://your-app.vercel.app)
- **Backend API**: [Deployed on Railway](https://your-backend.railway.app)

## ✨ Features

- **📚 Book Search**: Search 30+ million books with instant results
- **🔐 User Authentication**: Secure JWT-based authentication
- **📖 Personal Library**: Track reading progress (Want to Read, Reading, Completed)
- **⭐ Rating System**: Rate and review your favorite books
- **🎯 Smart Recommendations**: AI-powered personalized book suggestions
- **📊 Reading Stats**: Track your reading goals and progress
- **💨 Performance**: Optimized with caching and modern architecture

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for blazing-fast development
- **Tailwind CSS** for styling
- **TanStack Query** for data fetching
- **React Router** for navigation

### Backend
- **Node.js** with Express
- **PostgreSQL** database
- **JWT** authentication
- **bcrypt** for password hashing
- **Open Library API** integration

### Deployment
- **Frontend**: Vercel (optimized for React/Vite)
- **Backend**: Railway (Node.js + PostgreSQL)
- **Database**: Railway PostgreSQL
- **CDN**: Vercel Edge Network

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL (or use Railway's managed database)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/read-alike.git
   cd read-alike
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Configure your environment variables
   npm run migrate  # Set up database
   npm run dev     # Start backend server
   ```

3. **Setup Frontend**
   ```bash
   cd ../
   npm install
   cp .env.example .env.local
   # Configure VITE_API_URL
   npm run dev     # Start frontend server
   ```

### Environment Variables

**Backend (.env)**
```env
DATABASE_URL=postgresql://username:password@localhost:5432/readalike
JWT_SECRET=your-super-secret-jwt-key
FRONTEND_URL=http://localhost:8080
NODE_ENV=development
PORT=3001
```

**Frontend (.env.local)**
```env
VITE_API_URL=http://localhost:3001/api
```

## 🚢 Deployment

### Railway Backend Deployment

1. **Connect to Railway**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli

   # Login and deploy
   railway login
   railway init
   railway up
   ```

2. **Add PostgreSQL**
   - Go to Railway dashboard
   - Add PostgreSQL service
   - Copy DATABASE_URL to environment variables

3. **Environment Variables**
   ```
   DATABASE_URL=postgresql://...  # From Railway PostgreSQL
   JWT_SECRET=your-production-secret
   FRONTEND_URL=https://your-app.vercel.app
   NODE_ENV=production
   ```

### Vercel Frontend Deployment

1. **Connect to Vercel**
   ```bash
   # Install Vercel CLI
   npm install -g vercel

   # Deploy
   vercel
   ```

2. **Environment Variables**
   ```
   VITE_API_URL=https://your-backend.railway.app/api
   ```

## 📝 API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Books
- `GET /api/books/search?q=query` - Search books
- `GET /api/books/trending` - Get trending books
- `GET /api/books/:id` - Get book details

### User Library
- `GET /api/users/books` - Get user's books
- `POST /api/users/books` - Add book to library
- `PUT /api/users/books/:id` - Update book status/rating
- `DELETE /api/users/books/:id` - Remove book from library
- `GET /api/users/stats` - Get reading statistics

### Recommendations
- `GET /api/recommendations` - Get personalized recommendations

## 🏗️ Architecture

```
Frontend (Vercel)     Backend (Railway)     Database (Railway)
     │                      │                      │
  React App    ←→    Express API    ←→    PostgreSQL
     │                      │                      │
  TanStack Query      JWT Auth           Book Cache
  Tailwind CSS        Rate Limiting      User Data
```

## 🔒 Security Features

- **JWT Authentication** with secure token storage
- **Password Hashing** with bcrypt (12 rounds)
- **Rate Limiting** (100 requests per 15 minutes)
- **CORS Protection** with domain whitelist
- **SQL Injection Prevention** with parameterized queries
- **XSS Protection** with Helmet.js

## 📊 Performance Optimizations

- **Frontend Caching** with TanStack Query
- **Backend Caching** with node-cache
- **Database Indexing** on frequently queried fields
- **CDN Delivery** via Vercel Edge Network
- **Compression** with gzip
- **Lazy Loading** for images and components