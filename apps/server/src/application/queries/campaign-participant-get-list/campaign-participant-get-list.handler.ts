import { CampaignParticipantDto } from '@/application/dtos';
import { PaginatedResponseDto } from '@/application/dtos/pagination.dto';
import {
  CAMPAIGN_PARTICIPANT_READ_SERVICE,
  type ICampaignParticipantReadService,
} from '@/application/interfaces';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CampaignParticipantGetListQuery } from './campaign-participant-get-list.query';

@QueryHandler(CampaignParticipantGetListQuery)
export class CampaignParticipantGetListQueryHandler
  implements
    IQueryHandler<CampaignParticipantGetListQuery, PaginatedResponseDto<CampaignParticipantDto>>
{
  constructor(
    @Inject(CAMPAIGN_PARTICIPANT_READ_SERVICE) private readonly readService:
      ICampaignParticipantReadService,
  ) {}

  async execute(
    query: CampaignParticipantGetListQuery,
  ): Promise<PaginatedResponseDto<CampaignParticipantDto>> {
    return this.readService.findAll(query.filters, query.projection);
  }
}
