import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { RedisCacheService } from './redis-cache.service';
import { CACHE_SERVICE, REDIS_CLIENT } from '@/application/interfaces/cache.interface';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: (configService: ConfigService) => {
        const host = configService.get<string>('REDIS_HOST', 'localhost');
        const port = configService.get<number>('REDIS_PORT', 6379);
        const password = configService.get<string>('REDIS_PASSWORD');

        const client = new Redis({
          host,
          port,
          password,
          // Prevent application hang if Redis is not reachable during startup
          lazyConnect: true,
          maxRetriesPerRequest: 3,
          retryStrategy(times) {
            const delay = Math.min(times * 100, 3000);
            // Stop trying to reconnect after 3 attempts to prevent infinite background spamming
            if (times > 3) {
              return null;
            }
            return delay;
          }
        });

        client.on('error', (error) => {
          // Prevent unhandled error event crash/spam
          console.warn('[Redis] Connection error:', error.message);
        });

        return client;
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
