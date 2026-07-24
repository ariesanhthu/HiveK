import { ProposalDto } from '@/application/dtos';
import {
  CAMPAIGN_PROPOSAL_READ_SERVICE,
  type ICampaignProposalReadService,
} from '@/application/interfaces/read-service/proposal.read-service.interface';
import { ProposalNotFoundException } from '@/core/exceptions';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ProposalGetByIdQuery } from './proposal-get-by-id.query';

@QueryHandler(ProposalGetByIdQuery)
export class ProposalGetByIdHandler implements
  IQueryHandler<
    ProposalGetByIdQuery,
    ProposalDto
  >
{
  constructor(
    @Inject(CAMPAIGN_PROPOSAL_READ_SERVICE) private readonly proposalReadService:
      ICampaignProposalReadService,
  ) {}

  async execute(query: ProposalGetByIdQuery): Promise<ProposalDto> {
    const proposal = await this.proposalReadService.findById(query.id);
    if (!proposal) {
      throw new ProposalNotFoundException(query.id);
    }
    return proposal;
  }
}
