import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { SCHEDULED_POST_REPOSITORY, type IScheduledPostRepository } from '@/core/interfaces/repositories';
import { EVENT_SERVICE, type IEventService, UNIT_OF_WORK, type IUnitOfWork } from '@/application/interfaces';
import { ScheduledPostCancelCommand } from './scheduled-post-cancel.command';
import { InvalidOperationException } from '@/core/exceptions';

@CommandHandler(ScheduledPostCancelCommand)
export class ScheduledPostCancelHandler implements ICommandHandler<ScheduledPostCancelCommand, { success: boolean }> {
  constructor(
    @Inject(SCHEDULED_POST_REPOSITORY)
    private readonly scheduledPostRepository: IScheduledPostRepository,
    @Inject(EVENT_SERVICE)
    private readonly eventService: IEventService,
    @Inject(UNIT_OF_WORK)
    private readonly uow: IUnitOfWork,
  ) {}

  async execute(command: ScheduledPostCancelCommand): Promise<{ success: boolean }> {
    await this.uow.startTransaction();
    try {
      const post = await this.scheduledPostRepository.findById(command.postId);
      if (!post) {
        throw new Error('Scheduled post not found.');
      }
      if (post.enterpriseId !== command.enterpriseId) {
        throw new InvalidOperationException('Unauthorized enterprise operation on post.');
      }

      post.cancel();

      await this.scheduledPostRepository.save(post);
      await this.eventService.publishEvents(post);
      await this.uow.commitTransaction();

      return { success: true };
    } catch (error) {
      await this.uow.rollbackTransaction();
      throw error;
    }
  }
}
