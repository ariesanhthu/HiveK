import { Command } from '@nestjs/cqrs';
import { type PackageArchiveDto } from './package-archive.dto';

export class PackageArchiveCommand extends Command<void> {
	constructor(public readonly dto: PackageArchiveDto) {
		super();
	}
}
