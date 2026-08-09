import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  PACKAGE_READ_SERVICE,
  type IPackageReadService,
} from '@/application/interfaces';
import { PackageResponseDto } from '@/application/dtos';
import { PackageGetByIdQuery } from './package-get-by-id.query';

@QueryHandler(PackageGetByIdQuery)
export class PackageGetByIdHandler implements IQueryHandler<
  PackageGetByIdQuery,
  PackageResponseDto | null
> {
  constructor(
    @Inject(PACKAGE_READ_SERVICE)
    private readonly readService: IPackageReadService,
  ) {}

  async execute(
    query: PackageGetByIdQuery,
  ): Promise<PackageResponseDto | null> {
    const { input } = query;
    return this.readService.findById(input.id);
  }
}
