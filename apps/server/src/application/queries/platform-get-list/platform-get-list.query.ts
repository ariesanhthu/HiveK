import { PlatformDetailDto } from '@/application/dtos';
import { PaginatedResponseDto } from '@/application/dtos/pagination.dto';
import { Query } from '@nestjs/cqrs';
import { PlatformFilterDto } from './platform-get-list.dto';

export class PlatformGetListQuery extends Query<PaginatedResponseDto<PlatformDetailDto>> {
  constructor(public readonly filters?: PlatformFilterDto) {
    super();
  }
}
