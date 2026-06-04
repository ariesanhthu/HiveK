import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CAMPAIGN_PARTICIPANT_REPOSITORY, type ICampaignParticipantRepository } from '@/core/interfaces/repositories/campaign-participant.repository';
import { CampaignParticipantRoot } from '@/core/aggregate-roots';
import { InvalidOperationException } from '@/core/exceptions';
import { CampaignParticipantCreateCommand } from './campaign-participant-create.command';

@CommandHandler(CampaignParticipantCreateCommand)
export class CampaignParticipantCreateCommandHandler implements ICommandHandler<CampaignParticipantCreateCommand, string> {
  constructor(
    @Inject(CAMPAIGN_PARTICIPANT_REPOSITORY)
    private readonly participantRepository: ICampaignParticipantRepository,
  ) {}

  async execute(command: CampaignParticipantCreateCommand): Promise<string> {
    const { input } = command;

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
