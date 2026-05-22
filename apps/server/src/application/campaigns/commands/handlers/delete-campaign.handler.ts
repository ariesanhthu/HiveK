import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { CAMPAIGN_REPOSITORY, type ICampaignRepository } from '@/core/interfaces';
import { DeleteCampaignCommand } from '../delete-campaign.command';

@CommandHandler(DeleteCampaignCommand)
export class DeleteCampaignHandler implements ICommandHandler<DeleteCampaignCommand, void> {
  constructor(
    @Inject(CAMPAIGN_REPOSITORY)
    private readonly campaignRepository: ICampaignRepository,
  ) {}

  async execute(command: DeleteCampaignCommand): Promise<void> {
    const { id } = command;

    const campaign = await this.campaignRepository.findById(id);
    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${id} not found`);
    }

    await this.campaignRepository.delete(id);
  }
}
