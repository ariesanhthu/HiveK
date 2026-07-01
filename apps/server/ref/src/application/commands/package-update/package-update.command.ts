import { Command } from '@nestjs/cqrs';
import { type PackageUpdateDto } from './package-update.dto';
import type { PackageResponseDto } from '@/application/dtos';

export class PackageUpdateCommand extends Command<PackageResponseDto> {
	constructor(public readonly dto: PackageUpdateDto) {
		super();
	}
}
