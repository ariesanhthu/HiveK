import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PackageGetByCodeQuery } from './package-get-by-code.query';
import { type IPackageRepository, PACKAGE_REPOSITORY, EVersionStatus } from '@/core';
import { type ILoggerService, LOGGER_SERVICE } from '@/core/interfaces';
import { PackageResponseDto } from '@/application/dtos';
import { PackageMapper } from '@/application/mappers';
import { PackageNotFoundException } from '@/core';

@QueryHandler(PackageGetByCodeQuery)
export class PackageGetByCodeHandler implements IQueryHandler<PackageGetByCodeQuery> {
	constructor(
		@Inject(PACKAGE_REPOSITORY)
		private readonly packageRepository: IPackageRepository,
		@Inject(LOGGER_SERVICE)
		private readonly loggerService: ILoggerService
	) {}

	async execute(query: PackageGetByCodeQuery): Promise<PackageResponseDto> {
		const dto = query.dto;
		const activePackages = await this.packageRepository.findMany({
			code: dto.code,
			status: EVersionStatus.ACTIVE,
		});
		const pkg = activePackages[0];

		if (!pkg) {
			throw new PackageNotFoundException(dto.code);
		}

		return PackageMapper.toDto(pkg);
	}
}
