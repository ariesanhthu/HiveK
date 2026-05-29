import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { CAMPAIGN_REPOSITORY, type ICampaignRepository } from '@/core/interfaces/repositories';
import { CampaignRestoreCommand } from './campaign-restore.command';

@CommandHandler(CampaignRestoreCommand)
export class CampaignRestoreCommandHandler implements ICommandHandler<CampaignRestoreCommand, void> {
  constructor(
    @Inject(CAMPAIGN_REPOSITORY)
    private readonly campaignRepository: ICampaignRepository,
  ) { }

  async execute(command: CampaignRestoreCommand): Promise<void> {
    const { id } = command;

    const campaign = await this.campaignRepository.findById(id);
    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${id} not found`);
    }

    campaign.restore();
    await this.campaignRepository.save(campaign);
  }
}
