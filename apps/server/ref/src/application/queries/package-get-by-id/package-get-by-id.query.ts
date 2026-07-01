import { Query } from '@nestjs/cqrs';
import { type PackageGetByIdDto } from './package-get-by-id.dto';
import type { PackageResponseDto } from '@/application/dtos';

export class PackageGetByIdQuery extends Query<PackageResponseDto> {
	constructor(public readonly dto: PackageGetByIdDto) {
		super();
	}
}
