import { Module } from '@nestjs/common';
import { PaymentRedisModule } from '@/infrastructure/redis/redis.module';
import { PackageCacheService } from './package-cache.service';

@Module({
	imports: [PaymentRedisModule],
	providers: [PackageCacheService],
	exports: [PackageCacheService, PaymentRedisModule],
})
export class PackageCacheModule {}
