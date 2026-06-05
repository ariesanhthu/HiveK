import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CAMPAIGN_PARTICIPANT_REPOSITORY, type ICampaignParticipantRepository } from '@/core/interfaces/repositories/campaign-participant.repository';
import { CAMPAIGN_REPOSITORY, type ICampaignRepository } from '@/core/interfaces/repositories/campaign.repository';
import { CampaignParticipantRoot } from '@/core/aggregate-roots';
import { InvalidOperationException, CampaignNotFoundException } from '@/core/exceptions';
import { CampaignParticipantCreateCommand } from './campaign-participant-create.command';
import { ECampaignStatus } from '@/core/enums/campaign-status.enum';

@CommandHandler(CampaignParticipantCreateCommand)
export class CampaignParticipantCreateCommandHandler implements ICommandHandler<CampaignParticipantCreateCommand, string> {
  constructor(
    @Inject(CAMPAIGN_PARTICIPANT_REPOSITORY)
    private readonly participantRepository: ICampaignParticipantRepository,
    @Inject(CAMPAIGN_REPOSITORY)
    private readonly campaignRepository: ICampaignRepository,
  ) {}

  async execute(command: CampaignParticipantCreateCommand): Promise<string> {
    const { input } = command;

    const campaign = await this.campaignRepository.findById(input.campaignId);
    if (!campaign) {
      throw new CampaignNotFoundException(input.campaignId);
    }

    if (campaign.status !== ECampaignStatus.FINDING_KOL && campaign.status !== ECampaignStatus.IN_PROGRESS) {
      throw new InvalidOperationException('KOLs can only join campaigns that are in FINDING_KOL or IN_PROGRESS status');
    }

    const existing = await this.participantRepository.findByCampaignAndKol(
      input.campaignId,
      input.kolProfileId,
    );
    if (existing) {
      throw new InvalidOperationException('KOL is already a participant of this campaign');
    }

    const participant = CampaignParticipantRoot.create({
      campaignId: input.campaignId,
      kolProfileId: input.kolProfileId,
    });

    await this.participantRepository.save(participant);

    return participant.id!;
  }
}
