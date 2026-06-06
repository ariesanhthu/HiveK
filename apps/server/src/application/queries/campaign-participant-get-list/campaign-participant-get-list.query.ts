import { Query } from '@nestjs/cqrs';
import { PaginatedResponseDto } from '@/shared/dtos/pagination.dto';
import { CampaignParticipantDto } from '@/application/dtos';
import { CampaignParticipantFilterDto } from './campaign-participant-get-list.dto';

import { ProjectionDto } from '@/application/dtos/projection.dto';

export class CampaignParticipantGetListQuery extends Query<PaginatedResponseDto<CampaignParticipantDto>> {
  constructor(
    public readonly filters: CampaignParticipantFilterDto,
    public readonly projection?: ProjectionDto,
  ) {
    super();
  }
}
