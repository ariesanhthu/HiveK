import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PackageGetListQuery } from './package-get-list.query';
import { type IPackageRepository, PACKAGE_REPOSITORY } from '@/core';
import { type ILoggerService, LOGGER_SERVICE } from '@/core/interfaces';
import { PackageMapper } from '@/application/mappers';
import { PaginationCursorResponseDto } from '@/shared/dtos';
import type { PackageResponseDto } from '@/application/dtos';

@QueryHandler(PackageGetListQuery)
export class PackageGetListHandler implements IQueryHandler<PackageGetListQuery> {
	constructor(
		@Inject(PACKAGE_REPOSITORY)
		private readonly packageRepository: IPackageRepository,
		@Inject(LOGGER_SERVICE)
		private readonly loggerService: ILoggerService
	) {}

	async execute(
		query: PackageGetListQuery
	): Promise<PaginationCursorResponseDto<PackageResponseDto>> {
		const dto = query.dto;
		const limit = (dto.limit || 10) + 1;

		const packages = await this.packageRepository.findMany({
			...dto,
			limit,
		});

		const hasNextPage = packages.length >= limit;
		if (hasNextPage) {
			packages.pop();
		}
		return {
			items: PackageMapper.toDtoList(packages),
			nextCursor: hasNextPage ? packages[packages.length - 1].id : null,
		};
	}
}
