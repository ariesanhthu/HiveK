import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CAMPAIGN_PARTICIPANT_REPOSITORY, type ICampaignParticipantRepository } from '@/core/interfaces/repositories/campaign-participant.repository';
import { CampaignParticipantNotFoundException } from '@/core/exceptions';
import { CampaignParticipantSoftDeleteCommand } from './campaign-participant-soft-delete.command';

@CommandHandler(CampaignParticipantSoftDeleteCommand)
export class CampaignParticipantSoftDeleteCommandHandler implements ICommandHandler<CampaignParticipantSoftDeleteCommand, void> {
  constructor(
    @Inject(CAMPAIGN_PARTICIPANT_REPOSITORY)
    private readonly participantRepository: ICampaignParticipantRepository,
  ) {}

  async execute(command: CampaignParticipantSoftDeleteCommand): Promise<void> {
    const { id, deletedBy } = command;

    const participant = await this.participantRepository.findById(id);
    if (!participant) {
      throw new CampaignParticipantNotFoundException(id);
    }

    participant.softDelete(deletedBy);
    await this.participantRepository.save(participant);
  }
}
