import { Command } from '@nestjs/cqrs';
import { PackageCreateInputDto } from './package-create.dto';
import { PackageResponseDto } from '@/application/dtos';

export class PackageCreateCommand extends Command<PackageResponseDto> {
  constructor(public readonly input: PackageCreateInputDto) {
    super();
  }
}
