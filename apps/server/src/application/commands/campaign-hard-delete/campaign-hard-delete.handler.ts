import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CampaignNotFoundException } from '@/core/exceptions';
import { CAMPAIGN_REPOSITORY, type ICampaignRepository } from '@/core/interfaces/repositories';
import { CampaignHardDeleteCommand } from './campaign-hard-delete.command';

import { ECampaignStatus } from '@/core/enums/campaign-status.enum';
import { InvalidOperationException } from '@/core/exceptions';

@CommandHandler(CampaignHardDeleteCommand)
export class CampaignHardDeleteCommandHandler implements ICommandHandler<CampaignHardDeleteCommand, void> {
  constructor(
    @Inject(CAMPAIGN_REPOSITORY)
    private readonly campaignRepository: ICampaignRepository,
  ) { }

  async execute(command: CampaignHardDeleteCommand): Promise<void> {
    const { id } = command;

    const campaign = await this.campaignRepository.findById(id);
    if (!campaign) {
      throw new CampaignNotFoundException(id);
    }

    if (campaign.status !== ECampaignStatus.DRAFT && campaign.status !== ECampaignStatus.CANCELLED) {
      throw new InvalidOperationException('Campaign can only be deleted in DRAFT or CANCELLED status');
    }

    await this.campaignRepository.delete(id);
  }
}
