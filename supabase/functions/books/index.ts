import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// In-memory cache for better performance
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 30 * 60 * 1000 // 30 minutes

function getCached(key: string) {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }
  return null
}

function setCache(key: string, data: any) {
  cache.set(key, { data, timestamp: Date.now() })

  // Cleanup old entries
  if (cache.size > 100) {
    const entries = Array.from(cache.entries())
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp)
    for (let i = 0; i < 20; i++) {
      cache.delete(entries[i][0])
    }
  }
}

async function searchOpenLibrary(query: string, limit = 20) {
  const cacheKey = `search:${query}:${limit}`
  const cached = getCached(cacheKey)
  if (cached) return cached

  try {
    const params = new URLSearchParams({
      q: query,
      limit: Math.min(limit * 2, 100).toString(),
      fields: 'key,title,author_name,first_publish_year,isbn,cover_i,subject,ratings_average',
      sort: 'rating desc'
    })

    const response = await fetch(`https://openlibrary.org/search.json?${params}`)
    const data = await response.json()

    const books = data.docs
      .filter((doc: any) =>
        doc.title &&
        doc.author_name &&
        doc.first_publish_year &&
        doc.first_publish_year > 1800
      )
      .slice(0, limit)
      .map((doc: any) => ({
        id: doc.key.replace('/works/', ''),
        title: doc.title,
        author: doc.author_name[0],
        cover: doc.cover_i
          ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`
          : null,
        description: 'Loading description...',
        genre: normalizeGenres(doc.subject || []),
        rating: doc.ratings_average || 0,
        year: doc.first_publish_year || 0,
        amazonLink: generateAmazonLink(doc.title, doc.author_name?.[0])
      }))

    setCache(cacheKey, books)
    return books

  } catch (error) {
    console.error('OpenLibrary search error:', error)
    return []
  }
}

function normalizeGenres(subjects: string[]) {
  const genreMap: Record<string, string> = {
    'fiction': 'Fiction',
    'science fiction': 'Science Fiction',
    'fantasy': 'Fantasy',
    'mystery': 'Mystery',
    'thriller': 'Thriller',
    'romance': 'Romance',
    'horror': 'Horror',
    'biography': 'Biography',
    'history': 'History',
    'science': 'Science',
    'business': 'Business',
    'self-help': 'Self-Help'
  }

  return subjects
    .slice(0, 5)
    .map(subject => {
      const normalized = subject.toLowerCase().trim()
      return genreMap[normalized] ||
        subject.split(' ').map(word =>
          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ')
    })
    .filter((genre, index, arr) => arr.indexOf(genre) === index)
}

function generateAmazonLink(title: string, author?: string) {
  const searchQuery = encodeURIComponent(`${title} ${author || ''}`)
  return `https://www.amazon.com/s?k=${searchQuery}&i=stripbooks`
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const { method } = req
    const path = url.pathname.split('/').pop()

    if (method === 'GET' && path === 'search') {
      const query = url.searchParams.get('q')
      const limit = parseInt(url.searchParams.get('limit') || '20')

      if (!query || query.length < 2) {
        return new Response(
          JSON.stringify({ error: 'Query must be at least 2 characters' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const books = await searchOpenLibrary(query, limit)

      return new Response(
        JSON.stringify({
          books,
          total: books.length,
          query
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (method === 'GET' && path === 'trending') {
      const limit = parseInt(url.searchParams.get('limit') || '16')
      const cacheKey = `trending:${limit}`

      let books = getCached(cacheKey)
      if (!books) {
        const trendingQueries = [
          'bestseller 2024',
          'award winning fiction',
          'popular romance',
          'trending science fiction'
        ]

        const allBooks = []
        for (const query of trendingQueries) {
          const results = await searchOpenLibrary(query, Math.ceil(limit / trendingQueries.length))
          allBooks.push(...results)
        }

        // Remove duplicates and sort by rating
        const uniqueBooks = allBooks.filter((book: any, index: number, arr: any[]) =>
          arr.findIndex(b => b.id === book.id) === index
        )

        books = uniqueBooks
          .sort((a: any, b: any) => b.rating - a.rating)
          .slice(0, limit)

        setCache(cacheKey, books)
      }

      return new Response(
        JSON.stringify({ books }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (method === 'GET' && url.pathname.includes('/books/')) {
      const id = url.pathname.split('/').pop()
      const cacheKey = `book:${id}`

      let book = getCached(cacheKey)
      if (!book) {
        try {
          const response = await fetch(`https://openlibrary.org/works/${id}.json`)
          const work = await response.json()

          book = {
            id,
            title: work.title,
            author: 'Unknown Author',
            cover: work.covers?.[0]
              ? `https://covers.openlibrary.org/b/id/${work.covers[0]}-L.jpg`
              : null,
            description: typeof work.description === 'string'
              ? work.description
              : work.description?.value || 'No description available',
            genre: normalizeGenres(work.subjects || []),
            rating: 0,
            year: 0,
            amazonLink: generateAmazonLink(work.title)
          }

          setCache(cacheKey, book)
        } catch {
          return new Response(
            JSON.stringify({ error: 'Book not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
      }

      return new Response(
        JSON.stringify({ book }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Route not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})