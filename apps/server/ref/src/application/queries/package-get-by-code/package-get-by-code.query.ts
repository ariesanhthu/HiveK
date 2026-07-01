import { Query } from '@nestjs/cqrs';
import { type PackageGetByCodeDto } from './package-get-by-code.dto';
import type { PackageResponseDto } from '@/application/dtos';

export class PackageGetByCodeQuery extends Query<PackageResponseDto> {
	constructor(public readonly dto: PackageGetByCodeDto) {
		super();
	}
}
