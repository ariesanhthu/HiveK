import { Injectable, OnModuleInit, Inject, Logger } from '@nestjs/common';
import { Types } from 'mongoose';
import {
	PACKAGE_REPOSITORY,
	AUTH_SERVICE,
	type IAuthService,
	type IPackageRepository,
} from '@/core';
import { EPackageType, EPackageScope, EVersionStatus } from '@/core';
import { PackageEntity, PackageVariantEntity } from '@/core';
import { QuotaVO, PackageFeatureVO } from '@/core';
import { ECurrency } from '@/core';

const PRICING = {
	BASIC: { PRICE: 10000, DIS: 10 },
	PRO: { PRICE: 30000, DIS: 30 },
	ENTERPRISE: { PRICE: 100000, DIS: 100 },
	ADDON_STORAGE: { PRICE: 5000, DIS: 5 },
	ADDON_USERS: { PRICE: 5000, DIS: 5 },
	FULL_PERMISSION: { PRICE: 120000 },
};

const PERMISSIONS = {
	AUTH_BLOCK_USER: 'auth:BlockUser',
	AUTH_UNBLOCK_USER: 'auth:UnblockUser',
};

const CURRENCY = ECurrency.VND;

interface PackageSeedData {
	name: string;
	code: string;
	type: EPackageType;
	maxUsers: number;
	storageGb: number;
	price: number;
	features: string[];
	onlyYearlyVariant?: boolean;
}

@Injectable()
export class SeedingService implements OnModuleInit {
	private readonly logger = new Logger(SeedingService.name);

	constructor(
		@Inject(PACKAGE_REPOSITORY)
		private readonly packageRepository: IPackageRepository,
		@Inject(AUTH_SERVICE)
		private readonly authService: IAuthService
	) {}

	async onModuleInit() {
		await this.seedPackages();
		// await this.seedSubscriptions();
	}

	private async seedPackages() {
		this.logger.log('Checking and seeding packages...');

		let fetchedPermissions: string[] = [];
		try {
			const authRes = await this.authService.fetchPermissions();
			fetchedPermissions = authRes.permissions.map((p) => p.id);
			this.logger.log(
				`Fetched ${fetchedPermissions.length} permissions from Auth service for full package seeding.`
			);
		} catch (error) {
			this.logger.warn(
				`Auth service không reachable — FULL_PERMISSION_PLAN seed với features rỗng. ` +
					`Chạy auth-service (gRPC :50100) hoặc set AUTH_GRPC_URL=127.0.0.1:50100. ` +
					`Chi tiết: ${(error as Error).message}`
			);
		}

		const plans: PackageSeedData[] = [
			{
				name: 'Basic Plan',
				code: 'BASIC_PLAN',
				type: EPackageType.PLAN,
				maxUsers: 10,
				storageGb: 5,
				price: PRICING.BASIC.PRICE,
				features: [PERMISSIONS.AUTH_BLOCK_USER],
			},
			{
				name: 'Pro Plan',
				code: 'PRO_PLAN',
				type: EPackageType.PLAN,
				maxUsers: 50,
				storageGb: 20,
				price: PRICING.PRO.PRICE,
				features: [PERMISSIONS.AUTH_BLOCK_USER, PERMISSIONS.AUTH_UNBLOCK_USER],
			},
			{
				name: 'Enterprise Plan',
				code: 'ENT_PLAN',
				type: EPackageType.PLAN,
				maxUsers: 1000,
				storageGb: 1000,
				price: PRICING.ENTERPRISE.PRICE,
				features: [PERMISSIONS.AUTH_BLOCK_USER, PERMISSIONS.AUTH_UNBLOCK_USER],
			},
			{
				name: 'Full Access Plan',
				code: 'FULL_PERMISSION_PLAN',
				type: EPackageType.PLAN,
				maxUsers: 10000,
				storageGb: 10000,
				price: PRICING.FULL_PERMISSION.PRICE,
				features: fetchedPermissions,
				onlyYearlyVariant: true,
			},
		];

		const addons: PackageSeedData[] = [
			{
				name: 'Extra Storage',
				code: 'EXTRA_STORAGE',
				type: EPackageType.ADDON,
				maxUsers: 0,
				storageGb: 50,
				price: PRICING.ADDON_STORAGE.PRICE,
				features: [],
			},
			{
				name: 'Extra Users',
				code: 'EXTRA_USERS',
				type: EPackageType.ADDON,
				maxUsers: 10,
				storageGb: 0,
				price: PRICING.ADDON_USERS.PRICE,
				features: [],
			},
		];

		const allPackages: PackageSeedData[] = [...plans, ...addons];

		for (const pkgData of allPackages) {
			const existing = await this.packageRepository.findByCode(pkgData.code);
			if (existing && existing.length > 0) {
				continue;
			}

			const packageId = new Types.ObjectId().toString();

			const baseQuotas = new QuotaVO({
				maxUsers: pkgData.maxUsers,
				storageGb: pkgData.storageGb,
			});

			let variants: PackageVariantEntity[];
			if (pkgData.onlyYearlyVariant) {
				variants = [
					PackageVariantEntity.create({
						title: 'Annual Subscription',
						durationMonths: 12,
						price: pkgData.price,
						priceAfterDiscount: pkgData.price,
						tax: 0,
						currency: CURRENCY,
						extraQuotas: new QuotaVO({}),
					}),
				];
			} else {
				variants = [
					PackageVariantEntity.create({
						title: 'Monthly Subscription',
						durationMonths: 1,
						price: pkgData.price,
						priceAfterDiscount: pkgData.price,
						tax: 0,
						currency: CURRENCY,
						extraQuotas: new QuotaVO({}),
					}),
					PackageVariantEntity.create({
						title: 'Annual Subscription',
						durationMonths: 12,
						price: pkgData.price * 12 * 0.9, // 10% discount for yearly
						priceAfterDiscount: pkgData.price * 12 * 0.9,
						tax: 0,
						currency: CURRENCY,
						extraQuotas: new QuotaVO({}),
					}),
				];
			}

			const features =
				pkgData.features.length > 0
					? [
							new PackageFeatureVO({
								code: 'CORE_FEATURES',
								permissions: pkgData.features,
							}),
						]
					: [];

			const newPkg = PackageEntity.create(
				{
					code: pkgData.code,
					name: pkgData.name,
					description: `Description for ${pkgData.name}`,
					type: pkgData.type,
					scope: EPackageScope.PUBLIC,
					enterpriseId: null,
					status: EVersionStatus.ACTIVE,
					features: features,
					baseQuotas: baseQuotas,
					variants: variants,
					createdAt: new Date(),
					updatedAt: new Date(),
					activatedAt: new Date(),
				},
				packageId
			);

			await this.packageRepository.create(newPkg);
			this.logger.log(
				`Created package: ${pkgData.name} (${pkgData.code}) with ${variants.length} variant(s)`
			);
		}
	}
}
