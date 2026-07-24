import { ProposalNotFoundException } from '@/core/exceptions';
import {
  CAMPAIGN_PROPOSAL_REPOSITORY,
  type ICampaignProposalRepository,
} from '@/core/interfaces/repositories';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ProposalSoftDeleteCommand } from './proposal-soft-delete.command';

@CommandHandler(ProposalSoftDeleteCommand)
export class ProposalSoftDeleteCommandHandler implements
  ICommandHandler<
    ProposalSoftDeleteCommand,
    void
  >
{
  constructor(
    @Inject(CAMPAIGN_PROPOSAL_REPOSITORY) private readonly proposalRepository:
      ICampaignProposalRepository,
  ) {}

  async execute(command: ProposalSoftDeleteCommand): Promise<void> {
    const { id, deletedBy } = command;

    const proposal = await this.proposalRepository.findById(id);
    if (!proposal) {
      throw new ProposalNotFoundException(id);
    }

    proposal.softDelete(deletedBy);
    await this.proposalRepository.save(proposal);
  }
}
