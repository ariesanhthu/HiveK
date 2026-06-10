import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { USER_REPOSITORY, type IUserRepository } from '@/core/interfaces/repositories';
import { TargetType } from '@/core/enums/target-type.enum';
import { UploadedFileCreatedEvent } from './uploaded-file-created.event';

@EventsHandler(UploadedFileCreatedEvent)
export class LinkUserAvatarHandler implements IEventHandler<UploadedFileCreatedEvent> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) { }

  async handle(event: UploadedFileCreatedEvent): Promise<void> {
    if (event.targetType !== TargetType.USER) {
      return;
    }

    const field = event.targetField;
    if (field !== 'avatar' && field !== 'avatarUrl') {
      return;
    }

    const user = await this.userRepository.findById(event.targetId);
    if (!user) {
      return;
    }

    const anyProps = user.props as any;
    anyProps.avatar = event.fileId;
    anyProps.updatedAt = new Date();

    await this.userRepository.save(user);
  }
}
