import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CAMPAIGN_REPOSITORY, type ICampaignRepository } from '@/core/interfaces/repositories/campaign.repository';
import { KOL_PROFILE_REPOSITORY, type IKolProfileRepository } from '@/core/interfaces/repositories/kol-profile.repository';
import { CampaignParticipantNotFoundException, UserForbiddenException, InvalidOperationException } from '@/core/exceptions';
import { EParticipantStatus } from '@/core/enums';
import { CampaignParticipantUpdateStatusCommand } from './campaign-participant-update-status.command';

@CommandHandler(CampaignParticipantUpdateStatusCommand)
export class CampaignParticipantUpdateStatusCommandHandler implements ICommandHandler<CampaignParticipantUpdateStatusCommand, void> {
  constructor(
    @Inject(CAMPAIGN_REPOSITORY)
    private readonly campaignRepository: ICampaignRepository,
    @Inject(KOL_PROFILE_REPOSITORY)
    private readonly kolProfileRepository: IKolProfileRepository,
  ) {}

  async execute(command: CampaignParticipantUpdateStatusCommand): Promise<void> {
    const { id, userId, input } = command;

    const campaign = await this.campaignRepository.findByParticipantId(id);
    if (!campaign) {
      throw new CampaignParticipantNotFoundException(id);
    }

    const participant = campaign.participants.find(p => p.id === id);
    if (!participant) {
      throw new CampaignParticipantNotFoundException(id);
    }

    const kolProfile = await this.kolProfileRepository.findByUserId(userId);
    if (!kolProfile) {
      throw new UserForbiddenException();
    }

    if (kolProfile.id !== participant.kolProfileId) {
      throw new UserForbiddenException();
    }

    if (input.status === EParticipantStatus.JOINED) {
      campaign.joinParticipant(participant.kolProfileId);
    } else if (input.status === EParticipantStatus.REJECTED) {
      campaign.rejectParticipant(participant.kolProfileId);
    } else {
      throw new InvalidOperationException('Only JOINED or REJECTED status transitions are allowed');
    }

    await this.campaignRepository.save(campaign);
  }
}
