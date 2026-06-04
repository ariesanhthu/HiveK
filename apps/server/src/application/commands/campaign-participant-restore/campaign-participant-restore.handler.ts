import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CAMPAIGN_PARTICIPANT_REPOSITORY, type ICampaignParticipantRepository } from '@/core/interfaces/repositories/campaign-participant.repository';
import { CampaignParticipantNotFoundException } from '@/core/exceptions';
import { CampaignParticipantRestoreCommand } from './campaign-participant-restore.command';

@CommandHandler(CampaignParticipantRestoreCommand)
export class CampaignParticipantRestoreCommandHandler implements ICommandHandler<CampaignParticipantRestoreCommand, void> {
  constructor(
    @Inject(CAMPAIGN_PARTICIPANT_REPOSITORY)
    private readonly participantRepository: ICampaignParticipantRepository,
  ) {}

  async execute(command: CampaignParticipantRestoreCommand): Promise<void> {
    const { id } = command;

    const participant = await this.participantRepository.findById(id);
    if (!participant) {
      throw new CampaignParticipantNotFoundException(id);
    }

    participant.restore();
    await this.participantRepository.save(participant);
  }
}
