import { Book } from '@/types';

export interface BookSimilarity {
  book: Book;
  similarity: number;
}

interface TFIDFDocument {
  id: string;
  text: string;
  terms: Record<string, number>;
}

export class BookSimilarityService {
  private documents: TFIDFDocument[] = [];
  private vocabulary: Set<string> = new Set();
  private idf: Record<string, number> = {};

  constructor(books: Book[]) {
    this.buildCorpus(books);
    this.calculateIDF();
  }

  private buildCorpus(books: Book[]) {
    this.documents = books.map(book => {
      // Combine title, author, description, and genres for better similarity matching
      const text = [
        book.title,
        book.author,
        book.description,
        ...book.genre
      ].join(' ').toLowerCase();

      const terms = this.extractTerms(text);

      // Add terms to vocabulary
      Object.keys(terms).forEach(term => this.vocabulary.add(term));

      return {
        id: book.id,
        text,
        terms
      };
    });
  }

  private extractTerms(text: string): Record<string, number> {
    // Simple tokenization and term frequency calculation
    const words = text
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .split(/\s+/)
      .filter(word => word.length > 2) // Filter short words
      .filter(word => !this.isStopWord(word)); // Remove stop words

    const termFreq: Record<string, number> = {};

    words.forEach(word => {
      termFreq[word] = (termFreq[word] || 0) + 1;
    });

    // Normalize by document length
    const docLength = words.length;
    Object.keys(termFreq).forEach(term => {
      termFreq[term] = termFreq[term] / docLength;
    });

    return termFreq;
  }

  private isStopWord(word: string): boolean {
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have',
      'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
      'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we',
      'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'its',
      'our', 'their', 'about', 'into', 'through', 'during', 'before', 'after',
      'above', 'below', 'up', 'down', 'out', 'off', 'over', 'under', 'again',
      'further', 'then', 'once'
    ]);
    return stopWords.has(word.toLowerCase());
  }

  private calculateIDF() {
    const numDocs = this.documents.length;

    this.vocabulary.forEach(term => {
      const docsWithTerm = this.documents.filter(doc =>
        Object.keys(doc.terms).includes(term)
      ).length;

      // Add smoothing to avoid division by zero
      this.idf[term] = Math.log(numDocs / (docsWithTerm + 1));
    });
  }

  private getTFIDFVector(document: TFIDFDocument): Record<string, number> {
    const vector: Record<string, number> = {};

    this.vocabulary.forEach(term => {
      const tf = document.terms[term] || 0;
      const idf = this.idf[term] || 0;
      vector[term] = tf * idf;
    });

    return vector;
  }

  private cosineSimilarity(vectorA: Record<string, number>, vectorB: Record<string, number>): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    this.vocabulary.forEach(term => {
      const a = vectorA[term] || 0;
      const b = vectorB[term] || 0;

      dotProduct += a * b;
      normA += a * a;
      normB += b * b;
    });

    if (normA === 0 || normB === 0) return 0;

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  findSimilarBooks(targetBookId: string, books: Book[], limit: number = 5): BookSimilarity[] {
    const targetDoc = this.documents.find(doc => doc.id === targetBookId);
    if (!targetDoc) return [];

    const targetVector = this.getTFIDFVector(targetDoc);
    const similarities: BookSimilarity[] = [];

    this.documents.forEach(doc => {
      if (doc.id === targetBookId) return; // Skip the target book itself

      const docVector = this.getTFIDFVector(doc);
      const similarity = this.cosineSimilarity(targetVector, docVector);

      const book = books.find(b => b.id === doc.id);
      if (book && similarity > 0) {
        similarities.push({ book, similarity });
      }
    });

    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }

  // Helper method to get similarity explanation
  getExplanation(bookA: Book, bookB: Book): string[] {
    const reasons: string[] = [];

    // Check for common genres
    const commonGenres = bookA.genre.filter(g => bookB.genre.includes(g));
    if (commonGenres.length > 0) {
      reasons.push(`Similar genres: ${commonGenres.join(', ')}`);
    }

    // Check for same author
    if (bookA.author === bookB.author) {
      reasons.push(`Same author: ${bookA.author}`);
    }

    // Check for similar rating range
    const ratingDiff = Math.abs(bookA.rating - bookB.rating);
    if (ratingDiff <= 0.5) {
      reasons.push('Similar ratings');
    }

    // Check for similar publication era
    const yearDiff = Math.abs(bookA.year - bookB.year);
    if (yearDiff <= 5) {
      reasons.push('Similar publication period');
    }

    return reasons.length > 0 ? reasons : ['Similar content and themes'];
  }
}