import { Command } from '@nestjs/cqrs';
import { PackageArchiveInputDto } from './package-archive.dto';

export class PackageArchiveCommand extends Command<void> {
  constructor(public readonly input: PackageArchiveInputDto) {
    super();
  }
}
