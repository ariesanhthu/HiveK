import { Query } from '@nestjs/cqrs';
import { PackageGetByIdInputDto } from './package-get-by-id.dto';
import { PackageResponseDto } from '@/application/dtos';

export class PackageGetByIdQuery extends Query<PackageResponseDto | null> {
  constructor(public readonly input: PackageGetByIdInputDto) {
    super();
  }
}
