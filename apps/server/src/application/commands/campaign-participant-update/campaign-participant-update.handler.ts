import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  CAMPAIGN_REPOSITORY,
  type ICampaignRepository,
} from '@/core/interfaces/repositories/campaign.repository';
import { CampaignParticipantNotFoundException } from '@/core/exceptions';
import { EParticipantStatus } from '@/core/enums';
import { CampaignParticipantUpdateCommand } from './campaign-participant-update.command';

@CommandHandler(CampaignParticipantUpdateCommand)
export class CampaignParticipantUpdateCommandHandler implements ICommandHandler<
  CampaignParticipantUpdateCommand,
  void
> {
  constructor(
    @Inject(CAMPAIGN_REPOSITORY)
    private readonly campaignRepository: ICampaignRepository,
  ) {}

  async execute(command: CampaignParticipantUpdateCommand): Promise<void> {
    const { id, input } = command;

    const campaign = await this.campaignRepository.findByParticipantId(id);
    if (!campaign) {
      throw new CampaignParticipantNotFoundException(id);
    }

    const participant = campaign.participants.find((p) => p.id === id);
    if (!participant) {
      throw new CampaignParticipantNotFoundException(id);
    }

    if (input.status) {
      if (
        input.status === EParticipantStatus.JOINED &&
        participant.status === EParticipantStatus.PENDING_APPROVAL
      ) {
        campaign.joinParticipant(participant.kolProfileId);
      } else if (input.status === EParticipantStatus.REJECTED) {
        campaign.rejectParticipant(participant.kolProfileId);
      } else if (input.status === EParticipantStatus.COMPLETED) {
        campaign.completeParticipant(participant.kolProfileId);
      } else {
        participant.updateStatus(input.status);
      }
    }

    // @code-comment(SchedulePost): Output management disabled — schedule posts are now ScheduledPost IDs.
    // const findExistingOutput = ...;
    // if (input.outputs) { ... campaign.updateKOLOutputs(...); }

    await this.campaignRepository.save(campaign);
  }
}
