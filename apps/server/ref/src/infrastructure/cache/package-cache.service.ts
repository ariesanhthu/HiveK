import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import {
	REDIS_KEY_SERVICE,
	REDIS_STRING_SERVICE,
	type IRedisKeyService,
	type IRedisStringService,
} from '@sgod-redis/library';
import { PackageEntity } from '@/core';
import { deserializePackage, serializePackage } from './package-cache.serializer';

/** TTL read cache package — invalidation sau write qua command handlers. */
const PACKAGE_CACHE_TTL_SECONDS = 600;

export const packageCacheKey = (packageId: string) => `payment:cache:package:${packageId}`;

@Injectable()
export class PackageCacheService {
	private readonly logger = new Logger(PackageCacheService.name);
	private readonly enabled: boolean;

	constructor(
		@Inject(REDIS_STRING_SERVICE)
		@Optional()
		private readonly stringRedis: IRedisStringService | null,
		@Inject(REDIS_KEY_SERVICE)
		@Optional()
		private readonly keyRedis: IRedisKeyService | null
	) {
		this.enabled = stringRedis != null && keyRedis != null;
		if (!this.enabled) {
			this.logger.warn('Redis string/key không inject — package read cache tắt');
		}
	}

	get isEnabled(): boolean {
		return this.enabled;
	}

	async getById(packageId: string): Promise<PackageEntity | null> {
		if (!this.enabled || !packageId) return null;
		try {
			const raw = await this.stringRedis!.get(packageCacheKey(packageId));
			if (!raw) return null;
			return deserializePackage(raw);
		} catch (err) {
			this.logger.warn(
				`cache get ${packageId}: ${err instanceof Error ? err.message : String(err)}`
			);
			return null;
		}
	}

	async set(entity: PackageEntity): Promise<void> {
		if (!this.enabled || !entity.id) return;
		try {
			await this.stringRedis!.set(packageCacheKey(entity.id), serializePackage(entity), {
				ttl: PACKAGE_CACHE_TTL_SECONDS,
			});
		} catch (err) {
			this.logger.warn(
				`cache set ${entity.id}: ${err instanceof Error ? err.message : String(err)}`
			);
		}
	}

	async setMany(entities: PackageEntity[]): Promise<void> {
		for (const entity of entities) {
			await this.set(entity);
		}
	}

	/** Gọi sau commit write (UoW hoặc repository decorator). */
	async invalidate(packageId: string): Promise<void> {
		if (!this.enabled || !packageId) return;
		try {
			await this.keyRedis!.del(packageCacheKey(packageId));
		} catch (err) {
			this.logger.warn(
				`cache invalidate ${packageId}: ${err instanceof Error ? err.message : String(err)}`
			);
		}
	}

	async invalidateMany(packageIds: string[]): Promise<void> {
		const ids = [...new Set(packageIds.filter(Boolean))];
		if (!this.enabled || ids.length === 0) return;
		try {
			await this.keyRedis!.del(...ids.map(packageCacheKey));
		} catch (err) {
			this.logger.warn(
				`cache invalidateMany: ${err instanceof Error ? err.message : String(err)}`
			);
		}
	}
}
