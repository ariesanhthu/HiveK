import { Query } from '@nestjs/cqrs';
import { PlatformFilterDto } from './platform-get-list.dto';
import { PlatformDetailDto } from '@/application/dtos';
import { PaginatedResponseDto } from '@/shared/dtos/pagination.dto';

export class PlatformGetListQuery extends Query<PaginatedResponseDto<PlatformDetailDto>> {
  constructor(public readonly filters?: PlatformFilterDto) {
    super();
  }
}
