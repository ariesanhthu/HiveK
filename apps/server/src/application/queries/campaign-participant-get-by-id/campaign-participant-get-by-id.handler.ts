import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CAMPAIGN_PARTICIPANT_READ_SERVICE, type ICampaignParticipantReadService } from '@/application/interfaces';
import { CampaignParticipantDto } from '@/application/dtos';
import { CampaignParticipantGetByIdQuery } from './campaign-participant-get-by-id.query';

@QueryHandler(CampaignParticipantGetByIdQuery)
export class CampaignParticipantGetByIdQueryHandler implements IQueryHandler<CampaignParticipantGetByIdQuery, CampaignParticipantDto | null> {
  constructor(
    @Inject(CAMPAIGN_PARTICIPANT_READ_SERVICE)
    private readonly readService: ICampaignParticipantReadService,
  ) {}

  async execute(query: CampaignParticipantGetByIdQuery): Promise<CampaignParticipantDto | null> {
    return this.readService.findById(query.id);
  }
}
