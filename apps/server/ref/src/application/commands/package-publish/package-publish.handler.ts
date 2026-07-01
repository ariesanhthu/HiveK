import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PackagePublishCommand } from './package-publish.command';
import { type IUnitOfWork, UNIT_OF_WORK } from '@/core/interfaces';
import { type ILoggerService, LOGGER_SERVICE } from '@/core/interfaces';
import { EVersionStatus } from '@/core';
import { PackageNotFoundException } from '@/core';
import { DomainException } from '@/core';
import { PackageMapper } from '@/application/mappers/package.mapper';
import { PackageResponseDto } from '@/application/dtos/package.response.dto';
import { toError } from '@/shared/utils/error.util';
import { PackageCacheService } from '@/infrastructure/cache';

@CommandHandler(PackagePublishCommand)
export class PackagePublishHandler implements ICommandHandler<PackagePublishCommand> {
	constructor(
		@Inject(UNIT_OF_WORK)
		private readonly unitOfWork: IUnitOfWork,
		@Inject(LOGGER_SERVICE)
		private readonly logger: ILoggerService,
		private readonly packageCache: PackageCacheService
	) {
		this.logger.setContext(PackagePublishHandler.name);
	}

	async execute(command: PackagePublishCommand): Promise<PackageResponseDto> {
		const { dto } = command;
		const session = await this.unitOfWork.start();

		try {
			// 1. Retrieve Target Package
			const target = await session.packageRepository.findById(dto.id);
			if (!target) {
				throw new PackageNotFoundException(dto.id);
			}

			// 2. Validation: Status must be DRAFT or ARCHIVED
			if (
				target.status !== EVersionStatus.DRAFT &&
				target.status !== EVersionStatus.ARCHIVED
			) {
				throw new DomainException(
					`Cannot publish package with status '${target.status}'. Only DRAFT or ARCHIVED packages can be published.`
				);
			}

			// 3. Validation: Variants not empty
			if (target.variants?.length === 0) {
				throw new DomainException(
					`Cannot publish package '${target.code}' without variants.`
				);
			}

			// 4. Archive Current Active Version (if exists)
			const activePackages = await session.packageRepository.findMany({
				code: target.code,
				status: EVersionStatus.ACTIVE,
			});
			const active = activePackages[0];
			if (active && active.id !== target.id) {
				active.archive();
				await session.packageRepository.save(active);
				this.logger.log(`Archived existing active package ${active.code}`);
			}

			// 5. Activate Target Version
			target.activate();
			await session.packageRepository.save(target);

			await session.commit();
			const invalidateIds = [target.id];
			if (active?.id && active.id !== target.id) {
				invalidateIds.push(active.id);
			}
			void this.packageCache.invalidateMany(invalidateIds);

			this.logger.log(`Published package ${target.code} by ${dto.publishedBy}`);
			return PackageMapper.toDto(target);
		} catch (error) {
			await session.rollback();
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			const errorStack = error instanceof Error ? error.stack : undefined;
			this.logger.error(`Failed to publish package: ${errorMessage}`, errorStack);
			throw toError(error);
		} finally {
			await session.end();
		}
	}
}
