# Redis Integration Strategy

This document outlines the strategy for integrating Redis into the `apps/server` NestJS project using `ioredis`. The design follows Clean Architecture principles by abstracting caching logic behind an interface in the application layer.

## 1. Core Abstraction (Application Layer)

The interface is defined at [cache.interface.ts](file:///home/gnourt/data/hcmus/competition/start-up/HiveK/apps/server/src/application/interfaces/cache.interface.ts):

```typescript
export interface ICacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
  del(key: string): Promise<void>;
  delByPattern(pattern: string): Promise<void>;
}

export const CACHE_SERVICE = Symbol('ICacheService');
export const REDIS_CLIENT = 'REDIS_CLIENT';
```

## 2. Shared Key Utility

The generalized cache key helper is defined at [cache-key.util.ts](file:///home/gnourt/data/hcmus/competition/start-up/HiveK/apps/server/src/shared/utils/cache-key.util.ts):

```typescript
export class CacheKeyUtil {
  static id(domain: string, id: string): string {
    return `${domain.toLowerCase()}:id:${id}`;
  }

  static list(domain: string, filters: any): string {
    const filterKey = JSON.stringify(filters);
    return `${domain.toLowerCase()}:list:${filterKey}`;
  }

  static listPattern(domain: string): string {
    return `${domain.toLowerCase()}:list:*`;
  }

  static custom(domain: string, suffix: string): string {
    return `${domain.toLowerCase()}:${suffix}`;
  }
}
```

## 3. Infrastructure Implementation

### 3.1 Redis Service

Defined at [redis-cache.service.ts](file:///home/gnourt/data/hcmus/competition/start-up/HiveK/apps/server/src/infrastructure/cache/redis/redis-cache.service.ts):

```typescript
import { ICacheService, REDIS_CLIENT } from '@/application/interfaces/cache.interface';
import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisCacheService implements ICacheService, OnModuleDestroy {
  constructor(
    @Inject(REDIS_CLIENT) private readonly redisClient: Redis,
  ) {}

  async get<T>(key: string): Promise<T | null> {
    const data = await this.redisClient.get(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const data = JSON.stringify(value);
    if (ttlSeconds) {
      await this.redisClient.set(key, data, 'EX', ttlSeconds);
    } else {
      await this.redisClient.set(key, data);
    }
  }

  async del(key: string): Promise<void> {
    await this.redisClient.del(key);
  }

  async delByPattern(pattern: string): Promise<void> {
    const keys = await this.redisClient.keys(pattern);
    if (keys.length > 0) {
      await this.redisClient.del(...keys);
    }
  }

  onModuleDestroy() {
    this.redisClient.disconnect();
  }
}
```

### 3.2 Configuration & Module

The client module registers the connection dynamically and registers globally inside the application:
[redis-cache.module.ts](file:///home/gnourt/data/hcmus/competition/start-up/HiveK/apps/server/src/infrastructure/cache/redis/redis-cache.module.ts).

```typescript
import { CACHE_SERVICE, REDIS_CLIENT } from '@/application/interfaces/cache.interface';
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { RedisCacheService } from './redis-cache.service';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: (configService: ConfigService) => {
        const host = configService.get<string>('REDIS_HOST', 'localhost');
        const port = configService.get<number>('REDIS_PORT', 6379);
        const password = configService.get<string>('REDIS_PASSWORD');

        return new Redis({
          host,
          port,
          password,
          lazyConnect: true,
        });
      },
      inject: [ConfigService],
    },
    {
      provide: CACHE_SERVICE,
      useClass: RedisCacheService,
    },
  ],
  exports: [CACHE_SERVICE],
})
export class RedisCacheModule {}
```

## 4. Integration: Cache-Aside Example

Read services leverage `ICacheService` to perform Cache-Aside fetching. Below is the integration snippet inside `PlatformReadService`:

```typescript
const cacheKey = CacheKeyUtil.list('platform', filters);
const cached = await this.cacheService.get<PaginatedResponseDto<PlatformDetailDto>>(cacheKey);
if (cached) return cached;

// ... perform database query ...

await this.cacheService.set(cacheKey, response, 300); // 5 min TTL
```

## 5. Rationale

- **Decoupling**: The core and application layers are completely unaware of `ioredis` or the cache provider itself, communicating purely through `ICacheService`.
- **Generalized Key Utility**: `CacheKeyUtil` handles all dynamic domains centrally, guaranteeing consistent naming and formatting.
- **Lazy Connection**: The database setup connects lazily (`lazyConnect: true`) preventing backend start failures when Redis is offline.
