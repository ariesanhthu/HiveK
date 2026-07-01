import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PackageDeleteCommand } from './package-delete.command';
import { type IUnitOfWork, UNIT_OF_WORK } from '@/core/interfaces';
import { type ILoggerService, LOGGER_SERVICE } from '@/core/interfaces';
import { EVersionStatus } from '@/core';
import { PackageNotFoundException, PackageInUseException } from '@/core';
import { DomainException } from '@/core';
import { toError } from '@/shared/utils/error.util';
import { PackageCacheService } from '@/infrastructure/cache';

@CommandHandler(PackageDeleteCommand)
export class PackageDeleteHandler implements ICommandHandler<PackageDeleteCommand> {
	constructor(
		@Inject(UNIT_OF_WORK)
		private readonly unitOfWork: IUnitOfWork,
		@Inject(LOGGER_SERVICE)
		private readonly logger: ILoggerService,
		private readonly packageCache: PackageCacheService
	) {
		this.logger.setContext(PackageDeleteHandler.name);
	}

	async execute(command: PackageDeleteCommand): Promise<void> {
		const { dto } = command;
		const session = await this.unitOfWork.start();

		try {
			// 1. Retrieve Target Package
			const pkg = await session.packageRepository.findById(dto.id);
			if (!pkg) {
				throw new PackageNotFoundException(dto.id);
			}

			// 2. Validate Status
			if (pkg.status !== EVersionStatus.DRAFT && pkg.status !== EVersionStatus.ARCHIVED) {
				throw new DomainException(
					`Cannot delete package with status '${pkg.status}'. Only DRAFT or ARCHIVED packages can be deleted.`
				);
			}

			// 3. Check References (If ARCHIVED)
			if (pkg.status === EVersionStatus.ARCHIVED) {
				const isUsed = await session.subscriptionRepository.existsByPackageId(pkg.id);
				if (isUsed) {
					throw new PackageInUseException(pkg.id);
				}
			}

			// 4. Delete
			await session.packageRepository.delete(pkg.id);
			await session.commit();
			void this.packageCache.invalidate(pkg.id);

			this.logger.log(`Deleted package ${pkg.code} by ${dto.deletedBy}`);
		} catch (error) {
			await session.rollback();
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			this.logger.error(
				`Failed to delete package: ${errorMessage}`,
				error instanceof Error ? error.stack : undefined
			);
			throw toError(error);
		} finally {
			await session.end();
		}
	}
}
