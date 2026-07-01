import { Injectable, Inject } from '@nestjs/common';
import { PACKAGE_REPOSITORY, type IPackageRepository } from '@/core/interfaces';
import { PackageEntity, PackageVariantEntity } from '@/core';
import { EVersionStatus } from '@/core';
import { IUnitOfWorkSession } from '@/core/interfaces';

@Injectable()
export class PackageLookup {
	constructor(
		@Inject(PACKAGE_REPOSITORY)
		private readonly packageRepository: IPackageRepository
	) {}

	async findPackage(id: string, session?: IUnitOfWorkSession): Promise<PackageEntity | null> {
		const repo = session ? session.packageRepository : this.packageRepository;
		return repo.findById(id);
	}

	async findPackages(ids: string[], session?: IUnitOfWorkSession): Promise<PackageEntity[]> {
		if (!ids.length) return [];
		const repo = session ? session.packageRepository : this.packageRepository;
		return repo.findByIds(ids);
	}

	async findActivePackage(
		id: string,
		session?: IUnitOfWorkSession
	): Promise<PackageEntity | null> {
		const repo = session ? session.packageRepository : this.packageRepository;
		const pkg = await repo.findById(id);
		if (pkg?.status === EVersionStatus.ACTIVE) {
			return pkg;
		}
		return null;
	}

	async findPackageItems(
		items: { packageId: string; packageVariantId: string }[],
		session?: IUnitOfWorkSession
	): Promise<ResolvedPackageItem[]> {
		if (!items.length) return [];
		const packageIds = items.map((i) => i.packageId);
		const packages = await this.findPackages(packageIds, session);

		const packageMap = new Map(packages.map((v) => [v.id, v]));
		const result: ResolvedPackageItem[] = [];

		for (const item of items) {
			const pkg = packageMap.get(item.packageId);
			if (!pkg) {
				throw new Error(`Package not found: ${item.packageId}`);
			}

			const variant = pkg.variants.find((v) => v.id === item.packageVariantId);
			if (!variant) {
				throw new Error(
					`Package Variant not found: ${item.packageVariantId} in Package ${item.packageId}`
				);
			}

			result.push({
				pkg,
				variant,
			});
		}

		return result;
	}

	async packageExists(id: string, session?: IUnitOfWorkSession): Promise<boolean> {
		const repo = session ? session.packageRepository : this.packageRepository;
		return repo.exists(id);
	}
}

export interface ResolvedPackageItem {
	pkg: PackageEntity;
	variant: PackageVariantEntity;
}
