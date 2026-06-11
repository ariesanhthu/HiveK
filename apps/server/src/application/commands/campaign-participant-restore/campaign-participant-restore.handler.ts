import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CAMPAIGN_REPOSITORY, type ICampaignRepository } from '@/core/interfaces/repositories/campaign.repository';
import { CampaignParticipantNotFoundException } from '@/core/exceptions';
import { CampaignParticipantRestoreCommand } from './campaign-participant-restore.command';

@CommandHandler(CampaignParticipantRestoreCommand)
export class CampaignParticipantRestoreCommandHandler implements ICommandHandler<CampaignParticipantRestoreCommand, void> {
  constructor(
    @Inject(CAMPAIGN_REPOSITORY)
    private readonly campaignRepository: ICampaignRepository,
  ) {}

  async execute(command: CampaignParticipantRestoreCommand): Promise<void> {
    const { id } = command;

    const campaign = await this.campaignRepository.findByParticipantId(id);
    if (!campaign) {
      throw new CampaignParticipantNotFoundException(id);
    }

    campaign.restoreParticipant(id);
    await this.campaignRepository.save(campaign);
  }
}
