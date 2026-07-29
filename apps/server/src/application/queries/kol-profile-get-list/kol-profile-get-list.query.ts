import { Query } from '@nestjs/cqrs';
import { KolProfileFilterDto } from './kol-profile-get-list.dto';
import { KolProfileDto } from '@/application/dtos';
import { PaginatedResponseDto } from '@/application/dtos/pagination.dto';

import { ProjectionDto } from '@/application/dtos/projection.dto';

export class KolProfileGetListQuery extends Query<
  PaginatedResponseDto<KolProfileDto>
> {
  constructor(
    public readonly filters?: KolProfileFilterDto,
    public readonly projection?: ProjectionDto,
  ) {
    super();
  }
}
