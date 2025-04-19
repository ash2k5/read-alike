import { Book } from '@/types';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class CacheManager {
  private static instance: CacheManager;
  private cache: Map<string, CacheEntry<any>>;
  private readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

  private constructor() {
    this.cache = new Map();
  }

  public static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  public async get<T>(key: string, fetchFn: () => Promise<T>): Promise<T> {
    const entry = this.cache.get(key);
    const now = Date.now();

    if (entry && (now - entry.timestamp) < this.CACHE_TTL) {
      return entry.data as T;
    }

    const data = await fetchFn();
    this.cache.set(key, { data, timestamp: now });
    return data;
  }

  public clearCache(): void {
    this.cache.clear();
  }
}

export const cacheManager = CacheManager.getInstance(); 