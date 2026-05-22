import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CAMPAIGN_READ_SERVICE, type ICampaignReadService } from '@/application/interfaces';
import { CampaignDto, CampaignFilterDto } from '@/application/campaigns/dtos';
import { PaginatedResponseDto } from '@/shared/dtos/pagination.dto';

export class GetCampaignsQuery extends Query<PaginatedResponseDto<CampaignDto>> {
  constructor(public readonly filters?: CampaignFilterDto) {
    super();
  }
}

@QueryHandler(GetCampaignsQuery)
export class GetCampaignsHandler implements IQueryHandler<GetCampaignsQuery, PaginatedResponseDto<CampaignDto>> {
  constructor(
    @Inject(CAMPAIGN_READ_SERVICE)
    private readonly campaignReadService: ICampaignReadService,
  ) {}

  async execute(query: GetCampaignsQuery): Promise<PaginatedResponseDto<CampaignDto>> {
    return this.campaignReadService.findAll(query.filters);
  }
}
