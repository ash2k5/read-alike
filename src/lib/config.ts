const getEnvVar = (key: string): string => {
  if (typeof window !== 'undefined') {
    return (window as any).ENV?.[key] || '';
  } else {
    return process.env[key] || '';
  }
};

export const config = {
  googleBooksApiKey: getEnvVar('NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY'),
  googleBooksApiUrl: 'https://www.googleapis.com/books/v1/volumes',
  openLibraryCoversUrl: 'https://covers.openlibrary.org/b/isbn',
}; 