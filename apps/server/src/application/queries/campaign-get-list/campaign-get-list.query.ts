import { Query } from '@nestjs/cqrs';
import { CampaignFilterDto } from './campaign-get-list.dto';
import { CampaignDto } from '@/application/dtos';
import { PaginatedResponseDto } from '@/shared/dtos/pagination.dto';

import { ProjectionDto } from '@/application/dtos/projection.dto';

export class CampaignGetListQuery extends Query<PaginatedResponseDto<CampaignDto>> {
  constructor(
    public readonly filters?: CampaignFilterDto,
    public readonly projection?: ProjectionDto,
  ) {
    super();
  }
}
