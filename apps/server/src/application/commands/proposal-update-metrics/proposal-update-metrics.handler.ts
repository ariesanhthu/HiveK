import { ProposalNotFoundException } from '@/core/exceptions';
import {
  CAMPAIGN_PROPOSAL_REPOSITORY,
  type ICampaignProposalRepository,
} from '@/core/interfaces/repositories';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ProposalUpdateMetricsCommand } from './proposal-update-metrics.command';

@CommandHandler(ProposalUpdateMetricsCommand)
export class ProposalUpdateMetricsCommandHandler
  implements ICommandHandler<ProposalUpdateMetricsCommand, void>
{
  constructor(
    @Inject(CAMPAIGN_PROPOSAL_REPOSITORY) private readonly proposalRepository:
      ICampaignProposalRepository,
  ) {}

  async execute(command: ProposalUpdateMetricsCommand): Promise<void> {
    const { id, key, value } = command;

    const proposal = await this.proposalRepository.findById(id);
    if (!proposal) {
      throw new ProposalNotFoundException(id);
    }

    proposal.incrementMetric(key, value);
    await this.proposalRepository.save(proposal);
  }
}
