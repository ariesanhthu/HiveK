import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PackageUpdateCommand } from './package-update.command';
import { type IUnitOfWork, UNIT_OF_WORK } from '@/core/interfaces';
import { type ILoggerService, LOGGER_SERVICE } from '@/core/interfaces';
import { AUTH_SERVICE, type IAuthService } from '@/core';
import { PackageEntity, PackageVariantEntity } from '@/core';
import { PackageMapper } from '@/application/mappers/package.mapper';
import { PackageResponseDto } from '@/application/dtos/package.response.dto';
import { EVersionStatus } from '@/core';
import { PackageFeatureVO, QuotaVO } from '@/core';
import {
	PackageNotFoundException,
	DuplicateVariantException,
	InvalidPermissionException,
} from '@/core';
import { toError } from '@/shared/utils/error.util';
import { DomainException } from '@/core';
import { PackageUpdateDto, UpdateVariantDto } from './package-update.dto';
import { VariantDto, QuotaItemDto } from '@/application/dtos';
import { PackageCacheService } from '@/infrastructure/cache';

@CommandHandler(PackageUpdateCommand)
export class PackageUpdateHandler implements ICommandHandler<PackageUpdateCommand> {
	constructor(
		@Inject(UNIT_OF_WORK)
		private readonly unitOfWork: IUnitOfWork,
		@Inject(LOGGER_SERVICE)
		private readonly logger: ILoggerService,
		@Inject(AUTH_SERVICE)
		private readonly authService: IAuthService,
		private readonly packageCache: PackageCacheService
	) {
		this.logger.setContext(PackageUpdateHandler.name);
	}

	async execute(command: PackageUpdateCommand): Promise<PackageResponseDto> {
		const { dto } = command;
		const session = await this.unitOfWork.start();

		try {
			// 1. Retrieve Target Package
			const pkg = await session.packageRepository.findById(dto.id);
			if (!pkg) {
				throw new PackageNotFoundException(dto.id);
			}

			// 2. Validate Permissions
			if (dto.features) {
				const allPermissions = new Set(
					dto.features.flatMap((feature) => feature.permissions)
				);
				if (allPermissions.size > 0) {
					await this.validatePermissions(Array.from(allPermissions));
				}
			}

			// 3. Validate Status
			if (pkg.status !== EVersionStatus.DRAFT) {
				throw new DomainException(
					`Cannot update package with status '${pkg.status}'. Only DRAFT packages can be updated.`
				);
			}

			// 4. Update General Info & Metadata
			this.handleGeneralUpdates(pkg, dto);

			// 5. Process Variants
			this.handleDeleteVariants(pkg, dto.deletedVariants);
			this.handleUpdateVariants(pkg, dto.currentVariants);
			this.handleAddVariants(pkg, dto.newVariants);

			// 6. Validate Business Rules (Unique Titles)
			this.validateUniqueTitles(pkg);

			// 7. Persist
			await session.packageRepository.save(pkg);
			await session.commit();
			void this.packageCache.invalidate(pkg.id);

			this.logger.log(`Updated package ${pkg.code} by ${dto.updatedBy}`);
			return PackageMapper.toDto(pkg);
		} catch (error) {
			await session.rollback();
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			this.logger.error(
				`Failed to update package: ${errorMessage}`,
				error instanceof Error ? error.stack : undefined
			);
			throw toError(error);
		} finally {
			await session.end();
		}
	}

	private handleGeneralUpdates(pkg: PackageEntity, dto: PackageUpdateDto) {
		let features: PackageFeatureVO[] | undefined;
		let baseQuotas: QuotaVO | undefined;

		if (dto.features) {
			features = dto.features.map(
				(f) => new PackageFeatureVO({ code: f.code, permissions: f.permissions })
			);
		}
		if (dto.baseQuotas) {
			baseQuotas = this.mapQuotaItemsToVO(dto.baseQuotas);
		}

		pkg.updateGeneralInfo({
			name: dto.name,
			description: dto.description,
			type: dto.type,
			scope: dto.scope,
			features,
			baseQuotas,
		});
	}

	private handleDeleteVariants(pkg: PackageEntity, deletedIds?: string[]) {
		if (!deletedIds || deletedIds.length === 0) return;

		for (const id of deletedIds) {
			pkg.removeVariant(id);
		}
	}

	private handleUpdateVariants(pkg: PackageEntity, updates?: UpdateVariantDto[]) {
		if (!updates || updates.length === 0) return;

		for (const updateDto of updates) {
			const variant = pkg.variants.find((v) => v.id === updateDto.id);
			if (variant) {
				variant.update({
					title: updateDto.title,
					durationMonths: updateDto.durationMonths,
					price: updateDto.price,
					priceAfterDiscount: updateDto.priceAfterDiscount,
					tax: updateDto.tax,
					currency: updateDto.currency,
					extraQuotas: updateDto.extraQuotas
						? this.mapQuotaItemsToVO(updateDto.extraQuotas)
						: undefined,
				});
			} else {
				this.logger.warn(`Variant with ID ${updateDto.id} not found for update.`);
			}
		}
	}

	private handleAddVariants(pkg: PackageEntity, newVariants?: VariantDto[]) {
		if (!newVariants || newVariants.length === 0) return;

		for (const v of newVariants) {
			const newVariant = PackageVariantEntity.create({
				title: v.title,
				durationMonths: v.durationMonths,
				price: v.price,
				priceAfterDiscount: v.priceAfterDiscount,
				tax: v.tax,
				currency: v.currency,
				extraQuotas: this.mapQuotaItemsToVO(v.extraQuotas),
			});
			pkg.variants.push(newVariant);
		}
	}

	private validateUniqueTitles(pkg: PackageEntity) {
		const titles = new Set<string>();
		for (const v of pkg.variants) {
			if (titles.has(v.title)) {
				throw new DuplicateVariantException(`Variant title '${v.title}' is duplicated.`);
			}
			titles.add(v.title);
		}
	}

	private mapQuotaItemsToVO(items: QuotaItemDto[]): QuotaVO {
		const props: { [key: string]: number } = {};
		for (const item of items) {
			props[item.code] = item.limit;
		}
		return new QuotaVO(props);
	}

	private async validatePermissions(permissions: string[]): Promise<void> {
		this.logger.debug(`Validating ${permissions.length} permissions...`);

		const { permissions: availablePermissions } = await this.authService.fetchPermissions();

		const availablePermissionSet = new Set(availablePermissions.map((p) => p.id));
		const invalidPermissions = permissions.filter((p) => !availablePermissionSet.has(p));

		if (invalidPermissions.length > 0) {
			throw new InvalidPermissionException(
				`Invalid permissions found: ${invalidPermissions.join(', ')}`
			);
		}

		this.logger.debug('All permissions are valid.');
	}
}
