import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PackageArchiveCommand } from './package-archive.command';
import { type IUnitOfWork, UNIT_OF_WORK } from '@/core/interfaces';
import { type ILoggerService, LOGGER_SERVICE } from '@/core/interfaces';
import { EVersionStatus } from '@/core';
import { PackageNotFoundException } from '@/core';
import { DomainException } from '@/core';
import { toError } from '@/shared/utils/error.util';
import { PackageCacheService } from '@/infrastructure/cache';

@CommandHandler(PackageArchiveCommand)
export class PackageArchiveHandler implements ICommandHandler<PackageArchiveCommand> {
	constructor(
		@Inject(UNIT_OF_WORK)
		private readonly unitOfWork: IUnitOfWork,
		@Inject(LOGGER_SERVICE)
		private readonly logger: ILoggerService,
		private readonly packageCache: PackageCacheService
	) {
		this.logger.setContext(PackageArchiveHandler.name);
	}

	async execute(command: PackageArchiveCommand): Promise<void> {
		const { dto } = command;
		const session = await this.unitOfWork.start();

		try {
			// 1. Retrieve Target Package
			const targetPackage = await session.packageRepository.findById(dto.id);
			if (!targetPackage) {
				throw new PackageNotFoundException(dto.id);
			}

			// 2. Validate Status (Strict: ACTIVE -> ARCHIVED)
			if (targetPackage.status !== EVersionStatus.ACTIVE) {
				throw new DomainException(
					`Cannot archive package with status '${targetPackage.status}'. Only ACTIVE packages can be archived.`
				);
			}

			// 3. Archive Package
			targetPackage.archive();
			await session.packageRepository.save(targetPackage);

			await session.commit();
			void this.packageCache.invalidate(targetPackage.id);
			this.logger.log(`Archived package ${targetPackage.code} by ${dto.archivedBy}`);
		} catch (error) {
			await session.rollback();
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			this.logger.error(
				`Failed to archive package: ${errorMessage}`,
				error instanceof Error ? error.stack : undefined
			);
			throw toError(error);
		} finally {
			await session.end();
		}
	}
}
