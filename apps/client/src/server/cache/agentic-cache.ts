import { serverEnv } from '@/server/config/env';
import { createClient } from 'redis';

type CacheEntry = {
  expiresAt: number;
  value: string;
};

type RedisLike = {
  connect: () => Promise<unknown>;
  get: (key: string) => Promise<string | null>;
  setEx: (key: string, seconds: number, value: string) => Promise<unknown>;
  del: (key: string) => Promise<unknown>;
};

const memoryCache = new Map<string, CacheEntry>();

let redisClientPromise: Promise<RedisLike | null> | null = null;

function getMemoryValue(key: string): string | null {
  const entry = memoryCache.get(key);
  if (!entry) return null;

  if (entry.expiresAt <= Date.now()) {
    memoryCache.delete(key);
    return null;
  }

  return entry.value;
}

function setMemoryValue(key: string, value: string, ttlSeconds: number): void {
  memoryCache.set(key, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

async function getRedisClient(): Promise<RedisLike | null> {
  if (!serverEnv.redisUrl) return null;

  if (!redisClientPromise) {
    redisClientPromise = (async () => {
      try {
        const client = createClient({ url: serverEnv.redisUrl }) as unknown as RedisLike;
        await client.connect();
        return client;
      } catch {
        redisClientPromise = null;
        return null;
      }
    })();
  }

  return redisClientPromise;
}

export async function getCacheJson<TValue>(key: string): Promise<TValue | null> {
  const redisClient = await getRedisClient();

  if (redisClient) {
    const cachedValue = await redisClient.get(key);
    return cachedValue ? (JSON.parse(cachedValue) as TValue) : null;
  }

  const memoryValue = getMemoryValue(key);
  return memoryValue ? (JSON.parse(memoryValue) as TValue) : null;
}

export async function setCacheJson<TValue>(
  key: string,
  value: TValue,
  ttlSeconds = serverEnv.aiCacheTtlSeconds,
): Promise<void> {
  const serializedValue = JSON.stringify(value);
  const redisClient = await getRedisClient();

  if (redisClient) {
    await redisClient.setEx(key, ttlSeconds, serializedValue);
    return;
  }

  setMemoryValue(key, serializedValue, ttlSeconds);
}

export async function deleteCacheKey(key: string): Promise<void> {
  const redisClient = await getRedisClient();

  if (redisClient) {
    await redisClient.del(key);
    return;
  }

  memoryCache.delete(key);
}
