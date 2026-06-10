import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CAMPAIGN_PARTICIPANT_REPOSITORY, type ICampaignParticipantRepository } from '@/core/interfaces/repositories/campaign-participant.repository';
import { TargetType } from '@/core/enums/target-type.enum';
import { UploadedFileCreatedEvent } from './uploaded-file-created.event';

@EventsHandler(UploadedFileCreatedEvent)
export class LinkCampaignParticipantOutputFileHandler implements IEventHandler<UploadedFileCreatedEvent> {
  constructor(
    @Inject(CAMPAIGN_PARTICIPANT_REPOSITORY)
    private readonly participantRepository: ICampaignParticipantRepository,
  ) {}

  async handle(event: UploadedFileCreatedEvent): Promise<void> {
    if (event.targetType !== TargetType.CAMPAIGN_PARTICIPANT) {
      return;
    }

    const field = event.targetField;
    if (field !== 'fileId' && field !== 'file') {
      return;
    }

    const participant = await this.participantRepository.findByOutputId(event.targetId);
    if (!participant) {
      return;
    }

    participant.setOutputFileId(event.targetId, event.fileId);
    await this.participantRepository.save(participant);
  }
}
