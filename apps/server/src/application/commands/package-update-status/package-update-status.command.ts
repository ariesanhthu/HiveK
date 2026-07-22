import { Command } from '@nestjs/cqrs';
import { PackageUpdateStatusInputDto } from './package-update-status.dto';
import { PackageResponseDto } from '@/application/dtos';

export class PackageUpdateStatusCommand extends Command<PackageResponseDto> {
  constructor(
    public readonly id: string,
    public readonly input: PackageUpdateStatusInputDto,
  ) {
    super();
  }
}
