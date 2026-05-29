import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { CAMPAIGN_REPOSITORY, type ICampaignRepository } from '@/core/interfaces/repositories';
import { CampaignHardDeleteCommand } from './campaign-hard-delete.command';

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
      throw new NotFoundException(`Campaign with ID ${id} not found`);
    }

    await this.campaignRepository.delete(id);
  }
}
