import { Command } from '@nestjs/cqrs';
import { type PackagePublishDto } from './package-publish.dto';
import type { PackageResponseDto } from '@/application/dtos';

export class PackagePublishCommand extends Command<PackageResponseDto> {
	constructor(public readonly dto: PackagePublishDto) {
		super();
	}
}
