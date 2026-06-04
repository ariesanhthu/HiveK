import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CAMPAIGN_PARTICIPANT_REPOSITORY, type ICampaignParticipantRepository } from '@/core/interfaces/repositories/campaign-participant.repository';
import { CampaignParticipantNotFoundException, InvalidOperationException } from '@/core/exceptions';
import { CampaignParticipantHardDeleteCommand } from './campaign-participant-hard-delete.command';
import { EOutputStatus } from '@/core/enums';

@CommandHandler(CampaignParticipantHardDeleteCommand)
export class CampaignParticipantHardDeleteCommandHandler implements ICommandHandler<CampaignParticipantHardDeleteCommand, void> {
  constructor(
    @Inject(CAMPAIGN_PARTICIPANT_REPOSITORY)
    private readonly participantRepository: ICampaignParticipantRepository,
  ) {}

  async execute(command: CampaignParticipantHardDeleteCommand): Promise<void> {
    const { id } = command;

    const participant = await this.participantRepository.findById(id);
    if (!participant) {
      throw new CampaignParticipantNotFoundException(id);
    }

    const hasPublishedOutputs = participant.outputs.some(o => o.status === EOutputStatus.PUBLISHED);
    if (hasPublishedOutputs) {
      throw new InvalidOperationException('Cannot hard delete participant with published outputs');
    }

    await this.participantRepository.delete(id);
  }
}
