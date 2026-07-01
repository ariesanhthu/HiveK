import { Query } from '@nestjs/cqrs';
import { PackageGetListInputDto } from './package-get-list.dto';
import { PackageResponseDto } from '@/application/dtos';
import { PaginatedResponseDto } from '@/application/dtos/pagination.dto';

export class PackageGetListQuery extends Query<PaginatedResponseDto<PackageResponseDto>> {
  constructor(public readonly input: PackageGetListInputDto) {
    super();
  }
}
