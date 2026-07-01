import { Command } from '@nestjs/cqrs';
import { type PackageCreateDto } from './package-create.dto';
import type { PackageResponseDto } from '@/application/dtos';

export class PackageCreateCommand extends Command<PackageResponseDto> {
	constructor(public readonly dto: PackageCreateDto) {
		super();
	}
}
