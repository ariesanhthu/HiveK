import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ENTERPRISE_REPOSITORY, type IEnterpriseRepository } from '@/core/interfaces/repositories';
import { TargetType } from '@/core/enums/target-type.enum';
import { UploadedFileCreatedEvent } from './uploaded-file-created.event';

@EventsHandler(UploadedFileCreatedEvent)
export class LinkEnterpriseLogoHandler implements IEventHandler<UploadedFileCreatedEvent> {
  constructor(
    @Inject(ENTERPRISE_REPOSITORY)
    private readonly enterpriseRepository: IEnterpriseRepository,
  ) { }

  async handle(event: UploadedFileCreatedEvent): Promise<void> {
    if (event.targetType !== TargetType.ENTERPRISE) {
      return;
    }

    const field = event.targetField;
    if (field !== 'logo' && field !== 'logoUrlId') {
      return;
    }

    const enterprise = await this.enterpriseRepository.findById(event.targetId);
    if (!enterprise) {
      return;
    }

    enterprise.update({ logoUrlId: event.fileId });
    await this.enterpriseRepository.save(enterprise);
  }
}
