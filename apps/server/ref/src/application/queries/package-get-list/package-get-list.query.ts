import { Query } from '@nestjs/cqrs';
import { type PackageGetListDto } from './package-get-list.dto';
import type { PackageResponseDto } from '@/application/dtos';
import type { PaginationCursorResponseDto } from '@/shared/dtos';

export class PackageGetListQuery extends Query<PaginationCursorResponseDto<PackageResponseDto>> {
	constructor(public readonly dto: PackageGetListDto) {
		super();
	}
}
