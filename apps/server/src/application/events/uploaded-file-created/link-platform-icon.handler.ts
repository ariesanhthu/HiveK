import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PLATFORM_REPOSITORY, type IPlatformRepository } from '@/core/interfaces/repositories';
import { TargetType } from '@/core/enums/target-type.enum';
import { UploadedFileCreatedEvent } from './uploaded-file-created.event';

@EventsHandler(UploadedFileCreatedEvent)
export class LinkPlatformIconHandler implements IEventHandler<UploadedFileCreatedEvent> {
  constructor(
    @Inject(PLATFORM_REPOSITORY)
    private readonly platformRepository: IPlatformRepository,
  ) { }

  async handle(event: UploadedFileCreatedEvent): Promise<void> {
    if (event.targetType !== TargetType.PLATFORM) {
      return;
    }

    const field = event.targetField;
    if (field !== 'icon' && field !== 'iconUrl') {
      return;
    }

    const platform = await this.platformRepository.findById(event.targetId);
    if (!platform) {
      return;
    }

    platform.updateIcon(event.fileId);
    await this.platformRepository.save(platform);
  }
}
