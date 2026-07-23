import { CampaignDto } from '@/application/dtos';
import { CAMPAIGN_READ_SERVICE, type ICampaignReadService } from '@/application/interfaces';
import { CampaignNotFoundException } from '@/core/exceptions';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CampaignGetByIdQuery } from './campaign-get-by-id.query';

@QueryHandler(CampaignGetByIdQuery)
export class CampaignGetByIdHandler implements IQueryHandler<CampaignGetByIdQuery, CampaignDto> {
  constructor(
    @Inject(CAMPAIGN_READ_SERVICE) private readonly campaignReadService: ICampaignReadService,
  ) {}

  async execute(query: CampaignGetByIdQuery): Promise<CampaignDto> {
    const campaign = await this.campaignReadService.findById(query.id, query.projection);
    if (!campaign) {
      throw new CampaignNotFoundException(query.id);
    }
    return campaign;
  }
}
