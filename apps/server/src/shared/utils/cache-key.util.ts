import type { JsonObject } from '@/core/types/common.type';

export class CacheKeyUtil {
  /**
   * Builds an ID-based key.
   * e.g., platform:id:123
   */
  static id(domain: string, id: string): string {
    return `${domain.toLowerCase()}:id:${id}`;
  }

  /**
   * Builds a list/query-based key.
   * e.g., platform:list:{"limit":10}
   */
  static list(domain: string, filters: unknown): string {
    const filterKey = JSON.stringify(filters);
    return `${domain.toLowerCase()}:list:${filterKey}`;
  }

  /**
   * Builds a list pattern key for wildcard matching.
   * e.g., platform:list:*
   */
  static listPattern(domain: string): string {
    return `${domain.toLowerCase()}:list:*`;
  }

  /**
   * Builds a custom key suffix.
   * e.g., platform:custom-suffix
   */
  static custom(domain: string, suffix: string): string {
    return `${domain.toLowerCase()}:${suffix}`;
  }
}
