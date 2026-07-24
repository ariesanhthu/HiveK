import { ProposalNotFoundException } from '@/core/exceptions';
import {
  CAMPAIGN_PROPOSAL_REPOSITORY,
  type ICampaignProposalRepository,
} from '@/core/interfaces/repositories';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ProposalRestoreCommand } from './proposal-restore.command';

@CommandHandler(ProposalRestoreCommand)
export class ProposalRestoreCommandHandler implements
  ICommandHandler<
    ProposalRestoreCommand,
    void
  >
{
  constructor(
    @Inject(CAMPAIGN_PROPOSAL_REPOSITORY) private readonly proposalRepository:
      ICampaignProposalRepository,
  ) {}

  async execute(command: ProposalRestoreCommand): Promise<void> {
    const { id } = command;

    const proposal = await this.proposalRepository.findById(id);
    if (!proposal) {
      throw new ProposalNotFoundException(id);
    }

    proposal.restore();
    await this.proposalRepository.save(proposal);
  }
}
