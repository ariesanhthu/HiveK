import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { CAMPAIGN_READ_SERVICE, type ICampaignReadService } from '@/application/interfaces';
import { CampaignDto } from '@/application/campaigns/dtos';

export class GetCampaignByIdQuery extends Query<CampaignDto> {
  constructor(public readonly id: string) {
    super();
  }
}

@QueryHandler(GetCampaignByIdQuery)
export class GetCampaignByIdHandler implements IQueryHandler<GetCampaignByIdQuery, CampaignDto> {
  constructor(
    @Inject(CAMPAIGN_READ_SERVICE)
    private readonly campaignReadService: ICampaignReadService,
  ) {}

  async execute(query: GetCampaignByIdQuery): Promise<CampaignDto> {
    const campaign = await this.campaignReadService.findById(query.id);
    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${query.id} not found`);
    }
    return campaign;
  }
}
