import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CAMPAIGN_PROPOSAL_REPOSITORY, type ICampaignProposalRepository } from '@/core/interfaces/repositories';
import { ProposalNotFoundException } from '@/core/exceptions';
import { EProposalStatus } from '@/core/enums';
import { ProposalUpdateStatusCommand } from './proposal-update-status.command';

@CommandHandler(ProposalUpdateStatusCommand)
export class ProposalUpdateStatusCommandHandler implements ICommandHandler<ProposalUpdateStatusCommand, void> {
  constructor(
    @Inject(CAMPAIGN_PROPOSAL_REPOSITORY)
    private readonly proposalRepository: ICampaignProposalRepository,
  ) {}

  async execute(command: ProposalUpdateStatusCommand): Promise<void> {
    const { id, status } = command;

    const proposal = await this.proposalRepository.findById(id);
    if (!proposal) {
      throw new ProposalNotFoundException(id);
    }

    proposal.updateStatus(status as EProposalStatus);
    await this.proposalRepository.save(proposal);
  }
}
