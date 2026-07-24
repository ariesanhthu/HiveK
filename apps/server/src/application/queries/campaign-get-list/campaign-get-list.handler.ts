import { CampaignDto } from '@/application/dtos';
import { PaginatedResponseDto } from '@/application/dtos/pagination.dto';
import { CAMPAIGN_READ_SERVICE, type ICampaignReadService } from '@/application/interfaces';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CampaignGetListQuery } from './campaign-get-list.query';

@QueryHandler(CampaignGetListQuery)
export class CampaignGetListHandler implements
  IQueryHandler<
    CampaignGetListQuery,
    PaginatedResponseDto<CampaignDto>
  >
{
  constructor(
    @Inject(CAMPAIGN_READ_SERVICE) private readonly campaignReadService: ICampaignReadService,
  ) {}

  async execute(
    query: CampaignGetListQuery,
  ): Promise<PaginatedResponseDto<CampaignDto>> {
    return this.campaignReadService.findAll(query.filters, query.projection);
  }
}
