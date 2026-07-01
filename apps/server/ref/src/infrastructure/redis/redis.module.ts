import { Global, Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
	RedisModule as SgodRedisModule,
	REDIS_KEY_SERVICE,
	REDIS_STRING_SERVICE,
} from '@sgod-redis/library';
import { isRedisEnabled } from '@/infrastructure/config/redis-env';
import { createMockRedisKeyService, createMockRedisStringService } from './mock-redis.providers';

const redisEnabled = isRedisEnabled();

if (!redisEnabled) {
	new Logger('PaymentRedisModule').warn(
		'REDIS_ENABLED=false — package cache dùng mock in-memory.'
	);
}

const mockString = createMockRedisStringService();
const mockKey = createMockRedisKeyService();

@Global()
@Module({
	imports: redisEnabled
		? [
				SgodRedisModule.forRoot({
					isGlobal: true,
					useExisting: ConfigService,
				}),
			]
		: [],
	providers: redisEnabled
		? []
		: [
				{ provide: REDIS_STRING_SERVICE, useValue: mockString },
				{ provide: REDIS_KEY_SERVICE, useValue: mockKey },
			],
	exports: redisEnabled ? [] : [REDIS_STRING_SERVICE, REDIS_KEY_SERVICE],
})
export class PaymentRedisModule {}
