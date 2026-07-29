import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  PACKAGE_READ_SERVICE,
  type IPackageReadService,
} from '@/application/interfaces';
import { PackageResponseDto } from '@/application/dtos';
import { PackageGetByCodeQuery } from './package-get-by-code.query';

@QueryHandler(PackageGetByCodeQuery)
export class PackageGetByCodeHandler implements IQueryHandler<
  PackageGetByCodeQuery,
  PackageResponseDto[]
> {
  constructor(
    @Inject(PACKAGE_READ_SERVICE)
    private readonly readService: IPackageReadService,
  ) {}

  async execute(query: PackageGetByCodeQuery): Promise<PackageResponseDto[]> {
    const { input } = query;
    return this.readService.findByCode(input.code);
  }
}
