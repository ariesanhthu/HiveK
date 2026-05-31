import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CampaignNotFoundException } from '@/core/exceptions';
import { CAMPAIGN_REPOSITORY, type ICampaignRepository } from '@/core/interfaces/repositories';
import { CampaignSoftDeleteCommand } from './campaign-soft-delete.command';

@CommandHandler(CampaignSoftDeleteCommand)
export class CampaignSoftDeleteCommandHandler implements ICommandHandler<CampaignSoftDeleteCommand, void> {
  constructor(
    @Inject(CAMPAIGN_REPOSITORY)
    private readonly campaignRepository: ICampaignRepository,
  ) { }

  async execute(command: CampaignSoftDeleteCommand): Promise<void> {
    const { id, deletedBy } = command;

    const campaign = await this.campaignRepository.findById(id);
    if (!campaign) {
      throw new CampaignNotFoundException(id);
    }

    campaign.softDelete(deletedBy);
    await this.campaignRepository.save(campaign);
  }
}
