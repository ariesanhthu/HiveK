import { CampaignParticipantDto } from '@/application/dtos';
import {
  CAMPAIGN_PARTICIPANT_READ_SERVICE,
  type ICampaignParticipantReadService,
} from '@/application/interfaces';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CampaignParticipantGetByIdQuery } from './campaign-participant-get-by-id.query';

import { CampaignParticipantNotFoundException } from '@/core/exceptions';

@QueryHandler(CampaignParticipantGetByIdQuery)
export class CampaignParticipantGetByIdQueryHandler implements
  IQueryHandler<
    CampaignParticipantGetByIdQuery,
    CampaignParticipantDto
  >
{
  constructor(
    @Inject(CAMPAIGN_PARTICIPANT_READ_SERVICE) private readonly readService:
      ICampaignParticipantReadService,
  ) {}

  async execute(
    query: CampaignParticipantGetByIdQuery,
  ): Promise<CampaignParticipantDto> {
    const result = await this.readService.findById(query.id, query.projection);
    if (!result) {
      throw new CampaignParticipantNotFoundException(query.id);
    }
    return result;
  }
}
