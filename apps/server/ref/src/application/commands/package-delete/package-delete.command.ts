import { Command } from '@nestjs/cqrs';
import { type PackageDeleteDto } from './package-delete.dto';

export class PackageDeleteCommand extends Command<void> {
	constructor(public readonly dto: PackageDeleteDto) {
		super();
	}
}
