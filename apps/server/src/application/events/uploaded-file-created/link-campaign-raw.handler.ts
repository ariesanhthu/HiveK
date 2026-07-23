import { TargetType } from '@/core/enums/target-type.enum';
import { CAMPAIGN_REPOSITORY, type ICampaignRepository } from '@/core/interfaces/repositories';
import { Inject } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { UploadedFileCreatedEvent } from './uploaded-file-created.event';

@EventsHandler(UploadedFileCreatedEvent)
export class LinkCampaignRawHandler implements IEventHandler<UploadedFileCreatedEvent> {
  constructor(
    @Inject(CAMPAIGN_REPOSITORY) private readonly campaignRepository: ICampaignRepository,
  ) {}

  async handle(event: UploadedFileCreatedEvent): Promise<void> {
    if (event.targetType !== TargetType.CAMPAIGN) {
      return;
    }

    const field = event.targetField;
    if (field !== 'raw') {
      return;
    }

    const campaign = await this.campaignRepository.findById(event.targetId);
    if (!campaign) {
      return;
    }

    // Append raw content item to existing list
    const updatedRaw = [
      ...(campaign.rawContents || []),
      {
        fileId: event.fileId,
        rawContent: '',
      },
    ];

    campaign.update({ rawContents: updatedRaw });
    await this.campaignRepository.save(campaign);
  }
}
