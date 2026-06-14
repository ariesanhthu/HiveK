import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CAMPAIGN_PROPOSAL_READ_SERVICE, type ICampaignProposalReadService } from '@/application/interfaces/read-service/proposal.read-service.interface';
import { PaginatedResponseDto } from '@/application/dtos/pagination.dto';
import { ProposalDto } from '@/application/dtos';
import { ProposalGetListQuery } from './proposal-get-list.query';

@QueryHandler(ProposalGetListQuery)
export class ProposalGetListHandler implements IQueryHandler<ProposalGetListQuery, PaginatedResponseDto<ProposalDto>> {
  constructor(
    @Inject(CAMPAIGN_PROPOSAL_READ_SERVICE)
    private readonly proposalReadService: ICampaignProposalReadService,
  ) {}

  async execute(query: ProposalGetListQuery): Promise<PaginatedResponseDto<ProposalDto>> {
    return this.proposalReadService.findAll(query.filters);
  }
}
