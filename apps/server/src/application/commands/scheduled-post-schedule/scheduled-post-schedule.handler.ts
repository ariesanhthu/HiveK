import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  SCHEDULED_POST_REPOSITORY,
  type IScheduledPostRepository,
} from '@/core/interfaces/repositories';
import {
  EVENT_SERVICE,
  type IEventService,
  UNIT_OF_WORK,
  type IUnitOfWork,
} from '@/application/interfaces';
import { ScheduledPostScheduleCommand } from './scheduled-post-schedule.command';
import { ScheduledPostDto } from '@/application/dtos';
import { ScheduledPostMapper } from '@/application/mappers';
import { InvalidOperationException } from '@/core/exceptions';

@CommandHandler(ScheduledPostScheduleCommand)
export class ScheduledPostScheduleHandler implements ICommandHandler<
  ScheduledPostScheduleCommand,
  ScheduledPostDto
> {
  constructor(
    @Inject(SCHEDULED_POST_REPOSITORY)
    private readonly scheduledPostRepository: IScheduledPostRepository,
    @Inject(EVENT_SERVICE)
    private readonly eventService: IEventService,
    @Inject(UNIT_OF_WORK)
    private readonly uow: IUnitOfWork,
  ) {}

  async execute(
    command: ScheduledPostScheduleCommand,
  ): Promise<ScheduledPostDto> {
    await this.uow.startTransaction();
    try {
      const post = await this.scheduledPostRepository.findById(command.postId);
      if (!post) {
        throw new Error('Scheduled post not found.');
      }
      if (post.enterpriseId !== command.enterpriseId) {
        throw new InvalidOperationException(
          'Unauthorized enterprise operation on post.',
        );
      }

      post.schedule(command.scheduledAt);

      await this.scheduledPostRepository.save(post);
      await this.eventService.publishEvents(post);
      await this.uow.commitTransaction();

      return ScheduledPostMapper.toDto(post);
    } catch (error) {
      await this.uow.rollbackTransaction();
      throw error;
    }
  }
}
