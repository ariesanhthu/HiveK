import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CAMPAIGN_REPOSITORY, type ICampaignRepository } from '@/core/interfaces/repositories/campaign.repository';
import { CampaignParticipantNotFoundException, InvalidOperationException } from '@/core/exceptions';
import { CampaignParticipantHardDeleteCommand } from './campaign-participant-hard-delete.command';
import { EOutputStatus, EParticipantStatus } from '@/core/enums';

@CommandHandler(CampaignParticipantHardDeleteCommand)
export class CampaignParticipantHardDeleteCommandHandler implements ICommandHandler<CampaignParticipantHardDeleteCommand, void> {
  constructor(
    @Inject(CAMPAIGN_REPOSITORY)
    private readonly campaignRepository: ICampaignRepository,
  ) {}

  async execute(command: CampaignParticipantHardDeleteCommand): Promise<void> {
    const { id } = command;

    const campaign = await this.campaignRepository.findByParticipantId(id);
    if (!campaign) {
      throw new CampaignParticipantNotFoundException(id);
    }

    const participant = campaign.participants.find(p => p.id === id);
    if (!participant) {
      throw new CampaignParticipantNotFoundException(id);
    }

    if (participant.status !== EParticipantStatus.REJECTED) {
      throw new InvalidOperationException('Can only hard delete when status is REJECTED');
    }

    // Check outputs in schedule
    if (campaign.props.schedule?.timeline) {
      for (const day of campaign.props.schedule.timeline) {
        for (const post of day.posts) {
          const hasPublishedOutputs = post.campaignKOLOutputs.some(
            o => o.campaignParticipantId === id && o.status === EOutputStatus.PUBLISHED
          );
          if (hasPublishedOutputs) {
            throw new InvalidOperationException('Cannot hard delete participant with published outputs');
          }
        }
      }
    }

    // Remove participant and outputs
    campaign.removeParticipant(id);

    // Remove their outputs from schedule
    if (campaign.props.schedule?.timeline) {
      for (const day of campaign.props.schedule.timeline) {
        for (const post of day.posts) {
          post.campaignKOLOutputs = post.campaignKOLOutputs.filter(
            o => o.campaignParticipantId !== id
          );
        }
      }
    }

    await this.campaignRepository.save(campaign);
  }
}
