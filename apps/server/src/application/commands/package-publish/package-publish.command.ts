import { Command } from '@nestjs/cqrs';
import { PackagePublishInputDto } from './package-publish.dto';
import { PackageResponseDto } from '@/application/dtos';

export class PackagePublishCommand extends Command<PackageResponseDto> {
  constructor(public readonly input: PackagePublishInputDto) {
    super();
  }
}
