import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  PACKAGE_READ_SERVICE,
  type IPackageReadService,
} from '@/application/interfaces';
import { PackageResponseDto } from '@/application/dtos';
import { PaginatedResponseDto } from '@/application/dtos/pagination.dto';
import { PackageGetListQuery } from './package-get-list.query';

@QueryHandler(PackageGetListQuery)
export class PackageGetListHandler implements IQueryHandler<
  PackageGetListQuery,
  PaginatedResponseDto<PackageResponseDto>
> {
  constructor(
    @Inject(PACKAGE_READ_SERVICE)
    private readonly readService: IPackageReadService,
  ) {}

  async execute(
    query: PackageGetListQuery,
  ): Promise<PaginatedResponseDto<PackageResponseDto>> {
    const { input } = query;
    return this.readService.findAll(input);
  }
}
