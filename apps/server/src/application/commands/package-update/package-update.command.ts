import { Command } from '@nestjs/cqrs';
import { PackageUpdateInputDto } from './package-update.dto';
import { PackageResponseDto } from '@/application/dtos';

export class PackageUpdateCommand extends Command<PackageResponseDto> {
  constructor(
    public readonly id: string,
    public readonly input: PackageUpdateInputDto,
  ) {
    super();
  }
}
