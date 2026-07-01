import { Injectable } from '@nestjs/common';
import { PackageGetListDto } from '@/application/queries';
import { PackageEntity, type EPackageType, type IPackageRepository } from '@/core';
import { MongoPackageRepository } from '@/infrastructure/mongo/repositories/mongo-package.repository';
import { PackageCacheService } from './package-cache.service';

/**
 * Read-through cache cho `findById` / `findByIds` (không session UoW).
 * Write → Mongo trước, sau đó invalidate cache.
 */
@Injectable()
export class CachedPackageRepository implements IPackageRepository {
	constructor(
		private readonly inner: MongoPackageRepository,
		private readonly cache: PackageCacheService
	) {}

	async findById(id: string): Promise<PackageEntity | null> {
		const cached = await this.cache.getById(id);
		if (cached) return cached;

		const entity = await this.inner.findById(id);
		if (entity) void this.cache.set(entity);
		return entity;
	}

	async findByIds(ids: string[]): Promise<PackageEntity[]> {
		if (!ids.length) return [];

		const uniqueIds = [...new Set(ids)];
		const byId = new Map<string, PackageEntity>();
		const missing: string[] = [];

		if (this.cache.isEnabled) {
			for (const id of uniqueIds) {
				const cached = await this.cache.getById(id);
				if (cached) {
					byId.set(id, cached);
				} else {
					missing.push(id);
				}
			}
		} else {
			missing.push(...uniqueIds);
		}

		if (missing.length > 0) {
			const loaded = await this.inner.findByIds(missing);
			for (const entity of loaded) {
				if (entity.id) {
					byId.set(entity.id, entity);
					void this.cache.set(entity);
				}
			}
		}

		return uniqueIds.map((id) => byId.get(id)).filter((e): e is PackageEntity => e != null);
	}

	async exists(id: string): Promise<boolean> {
		const cached = await this.cache.getById(id);
		if (cached) return true;
		return this.inner.exists(id);
	}

	async create(entity: PackageEntity): Promise<PackageEntity> {
		const created = await this.inner.create(entity);
		if (created.id) void this.cache.set(created);
		return created;
	}

	async save(entity: PackageEntity): Promise<PackageEntity> {
		const saved = await this.inner.save(entity);
		if (saved.id) void this.cache.invalidate(saved.id);
		return saved;
	}

	async delete(id: string): Promise<void> {
		await this.inner.delete(id);
		void this.cache.invalidate(id);
	}

	async findMany(filter: PackageGetListDto): Promise<PackageEntity[]> {
		return this.inner.findMany(filter);
	}

	async findByCode(code: string): Promise<PackageEntity[]> {
		return this.inner.findByCode(code);
	}

	async findByType(type: EPackageType): Promise<PackageEntity[]> {
		return this.inner.findByType(type);
	}

	async findPublicPackages(): Promise<PackageEntity[]> {
		return this.inner.findPublicPackages();
	}

	async findByEnterpriseId(enterpriseId: string): Promise<PackageEntity[]> {
		return this.inner.findByEnterpriseId(enterpriseId);
	}

	async deleteByCode(code: string): Promise<void> {
		const packages = await this.inner.findByCode(code);
		await this.inner.deleteByCode(code);
		void this.cache.invalidateMany(
			packages.map((p) => p.id).filter((id): id is string => !!id)
		);
	}
}
