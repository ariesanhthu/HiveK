import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PackageGetByIdQuery } from './package-get-by-id.query';
import { type IPackageRepository, PACKAGE_REPOSITORY } from '@/core';
import { type ILoggerService, LOGGER_SERVICE } from '@/core/interfaces';
import { PackageResponseDto } from '@/application/dtos';
import { PackageMapper } from '@/application/mappers';
import { PackageNotFoundException } from '@/core';

@QueryHandler(PackageGetByIdQuery)
export class PackageGetByIdHandler implements IQueryHandler<PackageGetByIdQuery> {
	constructor(
		@Inject(PACKAGE_REPOSITORY)
		private readonly packageRepository: IPackageRepository,
		@Inject(LOGGER_SERVICE)
		private readonly loggerService: ILoggerService
	) {}

	async execute(query: PackageGetByIdQuery): Promise<PackageResponseDto> {
		const dto = query.dto;
		const pkg = await this.packageRepository.findById(dto.id);

		if (!pkg) {
			throw new PackageNotFoundException(dto.id);
		}

		return PackageMapper.toDto(pkg);
	}
}
