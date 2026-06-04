import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CAMPAIGN_PARTICIPANT_READ_SERVICE, type ICampaignParticipantReadService } from '@/application/interfaces';
import { PaginatedResponseDto } from '@/shared/dtos/pagination.dto';
import { CampaignParticipantDto } from '@/application/dtos';
import { CampaignParticipantGetListQuery } from './campaign-participant-get-list.query';

@QueryHandler(CampaignParticipantGetListQuery)
export class CampaignParticipantGetListQueryHandler implements IQueryHandler<CampaignParticipantGetListQuery, PaginatedResponseDto<CampaignParticipantDto>> {
  constructor(
    @Inject(CAMPAIGN_PARTICIPANT_READ_SERVICE)
    private readonly readService: ICampaignParticipantReadService,
  ) {}

  async execute(query: CampaignParticipantGetListQuery): Promise<PaginatedResponseDto<CampaignParticipantDto>> {
    return this.readService.findAll(query.filters);
  }
}
