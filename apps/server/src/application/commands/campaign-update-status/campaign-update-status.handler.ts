import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CampaignNotFoundException, CampaignForbiddenException } from '@/core/exceptions';
import { CAMPAIGN_REPOSITORY, type ICampaignRepository } from '@/core/interfaces/repositories';
import { CampaignUpdateStatusCommand } from './campaign-update-status.command';

@CommandHandler(CampaignUpdateStatusCommand)
export class CampaignUpdateStatusCommandHandler implements ICommandHandler<CampaignUpdateStatusCommand, void> {
  constructor(
    @Inject(CAMPAIGN_REPOSITORY)
    private readonly campaignRepository: ICampaignRepository,
  ) { }

  async execute(command: CampaignUpdateStatusCommand): Promise<void> {
    const { id, requestedBy, status } = command;

    const campaign = await this.campaignRepository.findById(id);
    if (!campaign) {
      throw new CampaignNotFoundException(id);
    }

    if (campaign.ownerId !== requestedBy) {
      throw new CampaignForbiddenException();
    }

    campaign.updateStatus(status);

    await this.campaignRepository.save(campaign);
  }
}
