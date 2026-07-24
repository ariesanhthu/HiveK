import { ProposalDto } from '@/application/dtos';
import { PaginatedResponseDto } from '@/application/dtos/pagination.dto';
import {
  CAMPAIGN_PROPOSAL_READ_SERVICE,
  type ICampaignProposalReadService,
} from '@/application/interfaces/read-service/proposal.read-service.interface';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ProposalGetListQuery } from './proposal-get-list.query';

@QueryHandler(ProposalGetListQuery)
export class ProposalGetListHandler implements
  IQueryHandler<
    ProposalGetListQuery,
    PaginatedResponseDto<ProposalDto>
  >
{
  constructor(
    @Inject(CAMPAIGN_PROPOSAL_READ_SERVICE) private readonly proposalReadService:
      ICampaignProposalReadService,
  ) {}

  async execute(
    query: ProposalGetListQuery,
  ): Promise<PaginatedResponseDto<ProposalDto>> {
    return this.proposalReadService.findAll(query.filters);
  }
}
