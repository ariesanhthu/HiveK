export interface ICacheService {
  /**
   * Get a cached item.
   */
  get<T>(key: string): Promise<T | null>;

  /**
   * Set a cached item with an optional TTL in seconds.
   */
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;

  /**
   * Delete a cached item.
   */
  del(key: string): Promise<void>;

  /**
   * Delete cached items matching a wildcard pattern.
   * Useful for invalidating collections/lists.
   */
  delByPattern(pattern: string): Promise<void>;
}

export const CACHE_SERVICE = Symbol('ICacheService');
export const REDIS_CLIENT = 'REDIS_CLIENT';
