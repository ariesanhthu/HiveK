import { Command } from '@nestjs/cqrs';
import { PackageDeleteInputDto } from './package-delete.dto';

export class PackageDeleteCommand extends Command<void> {
  constructor(public readonly input: PackageDeleteInputDto) {
    super();
  }
}
