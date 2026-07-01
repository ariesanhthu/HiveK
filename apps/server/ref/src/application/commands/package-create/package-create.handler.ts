import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PackageCreateCommand } from './package-create.command';
import { type IUnitOfWork, UNIT_OF_WORK } from '@/core/interfaces';
import { type ILoggerService, LOGGER_SERVICE } from '@/core/interfaces';
import { PackageEntity } from '@/core';
import { PackageMapper } from '@/application/mappers/package.mapper';
import { PackageResponseDto } from '@/application/dtos/package.response.dto';
import { EVersionStatus } from '@/core';
import { QuotaVO } from '@/core';
import { PackageCodeAlreadyExistsException } from '@/core';
import { toError } from '@/shared/utils/error.util';
import { PackageCacheService } from '@/infrastructure/cache';

@CommandHandler(PackageCreateCommand)
export class PackageCreateHandler implements ICommandHandler<PackageCreateCommand> {
	constructor(
		@Inject(UNIT_OF_WORK)
		private readonly unitOfWork: IUnitOfWork,
		@Inject(LOGGER_SERVICE)
		private readonly logger: ILoggerService,
		private readonly packageCache: PackageCacheService
	) {
		this.logger.setContext(PackageCreateHandler.name);
	}

	async execute(command: PackageCreateCommand): Promise<PackageResponseDto> {
		const { dto } = command;
		const session = await this.unitOfWork.start();

		try {
			// Check for existing package code
			const existing = await session.packageRepository.findByCode(dto.code);
			if (existing.length > 0) {
				throw new PackageCodeAlreadyExistsException(dto.code);
			}

			// Create a single PackageEntity with metadata
			let packageEntity = PackageEntity.create({
				code: dto.code,
				name: dto.name,
				description: dto.description,
				type: dto.type,
				scope: dto.scope,
				enterpriseId: dto.enterpriseId || null,
				status: EVersionStatus.DRAFT,
				features: [],
				baseQuotas: new QuotaVO({}),
				variants: [],
				createdAt: new Date(),
				updatedAt: new Date(),
				activatedAt: undefined,
			});

			// Returns entity with populated ID
			packageEntity = await session.packageRepository.create(packageEntity);

			await session.commit();
			if (packageEntity.id) {
				void this.packageCache.set(packageEntity);
			}
			return PackageMapper.toDto(packageEntity);
		} catch (error) {
			await session.rollback();
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			const errorStack = error instanceof Error ? error.stack : undefined;
			this.logger.error(`Failed to create package: ${errorMessage}`, errorStack);
			throw toError(error);
		} finally {
			await session.end();
		}
	}
}
