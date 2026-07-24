import { CACHE_SERVICE, REDIS_CLIENT } from '@/application/interfaces/cache.interface';
import { RedisConfig } from '@/configs';
import { Global, Module } from '@nestjs/common';
import Redis from 'ioredis';
import { RedisCacheService } from './redis-cache.service';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: (redisConfig: RedisConfig) => {
        return new Redis({
          host: redisConfig.getHost(),
          port: redisConfig.getPort(),
          password: redisConfig.getPassword(),
          // Prevent application hang if Redis is not reachable during startup
          lazyConnect: true,
        });
      },
      inject: [RedisConfig],
    },
    {
      provide: CACHE_SERVICE,
      useClass: RedisCacheService,
    },
  ],
  exports: [CACHE_SERVICE],
})
export class RedisCacheModule {}
