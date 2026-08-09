import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ProposalNotFoundException } from '@/core/exceptions';
import {
  CAMPAIGN_PROPOSAL_READ_SERVICE,
  type ICampaignProposalReadService,
} from '@/application/interfaces/read-service/proposal.read-service.interface';
import { ProposalDto } from '@/application/dtos';
import { ProposalGetBySlugQuery } from './proposal-get-by-slug.query';

@QueryHandler(ProposalGetBySlugQuery)
export class ProposalGetBySlugHandler implements IQueryHandler<
  ProposalGetBySlugQuery,
  ProposalDto
> {
  constructor(
    @Inject(CAMPAIGN_PROPOSAL_READ_SERVICE)
    private readonly proposalReadService: ICampaignProposalReadService,
  ) {}

  async execute(query: ProposalGetBySlugQuery): Promise<ProposalDto> {
    const proposal = await this.proposalReadService.findBySlug(query.slug);
    if (!proposal) {
      throw new ProposalNotFoundException(query.slug);
    }
    return proposal;
  }
}
