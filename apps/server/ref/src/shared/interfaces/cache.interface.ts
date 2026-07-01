export interface ICacheService {
	get<T>(key: string): Promise<T | undefined>;
	set(key: string, value: unknown, ttl?: number): Promise<void>;
	del(key: string): Promise<void>;
}

export const CACHE_SERVICE = Symbol('ICacheService');
