import { Query } from '@nestjs/cqrs';
import { PackageGetByCodeInputDto } from './package-get-by-code.dto';
import { PackageResponseDto } from '@/application/dtos';

export class PackageGetByCodeQuery extends Query<PackageResponseDto[]> {
  constructor(public readonly input: PackageGetByCodeInputDto) {
    super();
  }
}
