import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CAMPAIGN_REPOSITORY, type ICampaignRepository } from '@/core/interfaces/repositories/campaign.repository';
import { TargetType } from '@/core/enums/target-type.enum';
import { UploadedFileCreatedEvent } from './uploaded-file-created.event';

@EventsHandler(UploadedFileCreatedEvent)
export class LinkCampaignParticipantOutputFileHandler implements IEventHandler<UploadedFileCreatedEvent> {
  constructor(
    @Inject(CAMPAIGN_REPOSITORY)
    private readonly campaignRepository: ICampaignRepository,
  ) {}

  async handle(event: UploadedFileCreatedEvent): Promise<void> {
    if (event.targetType !== TargetType.CAMPAIGN_PARTICIPANT) {
      return;
    }

    const field = event.targetField;
    if (field !== 'fileId' && field !== 'file') {
      return;
    }

    const campaign = await this.campaignRepository.findByOutputId(event.targetId);
    if (!campaign) {
      return;
    }

    campaign.setOutputFileId(event.targetId, event.fileId);
    await this.campaignRepository.save(campaign);
  }
}
