import { CampaignParticipantNotFoundException } from '@/core/exceptions';
import {
  CAMPAIGN_REPOSITORY,
  type ICampaignRepository,
} from '@/core/interfaces/repositories/campaign.repository';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CampaignParticipantSoftDeleteCommand } from './campaign-participant-soft-delete.command';

@CommandHandler(CampaignParticipantSoftDeleteCommand)
export class CampaignParticipantSoftDeleteCommandHandler
  implements ICommandHandler<CampaignParticipantSoftDeleteCommand, void>
{
  constructor(
    @Inject(CAMPAIGN_REPOSITORY) private readonly campaignRepository: ICampaignRepository,
  ) {}

  async execute(command: CampaignParticipantSoftDeleteCommand): Promise<void> {
    const { id, deletedBy } = command;

    const campaign = await this.campaignRepository.findByParticipantId(id);
    if (!campaign) {
      throw new CampaignParticipantNotFoundException(id);
    }

    campaign.softDeleteParticipant(id, deletedBy);
    await this.campaignRepository.save(campaign);
  }
}
