import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  SOCIAL_PAGE_REPOSITORY,
  type ISocialPageRepository,
  SCHEDULED_POST_REPOSITORY,
  type IScheduledPostRepository,
} from '@/core/interfaces/repositories';
import { EVENT_SERVICE, type IEventService, UNIT_OF_WORK, type IUnitOfWork } from '@/application/interfaces';
import { ScheduledPostRoot } from '@/core/aggregate-roots';
import { ScheduledPostCreateCommand } from './scheduled-post-create.command';
import { ScheduledPostDto } from '@/application/dtos';
import { ScheduledPostMapper } from '@/application/mappers';
import { InvalidOperationException } from '@/core/exceptions';

@CommandHandler(ScheduledPostCreateCommand)
export class ScheduledPostCreateHandler implements ICommandHandler<ScheduledPostCreateCommand, ScheduledPostDto> {
  constructor(
    @Inject(SOCIAL_PAGE_REPOSITORY)
    private readonly socialPageRepository: ISocialPageRepository,
    @Inject(SCHEDULED_POST_REPOSITORY)
    private readonly scheduledPostRepository: IScheduledPostRepository,
    @Inject(EVENT_SERVICE)
    private readonly eventService: IEventService,
    @Inject(UNIT_OF_WORK)
    private readonly uow: IUnitOfWork,
  ) {}

  async execute(command: ScheduledPostCreateCommand): Promise<ScheduledPostDto> {
    const { enterpriseId, userId, input } = command;

    await this.uow.startTransaction();
    try {
      const socialPage = await this.socialPageRepository.findById(input.socialPageId);
      if (!socialPage) {
        throw new Error('Social page connection not found.');
      }
      if (socialPage.enterpriseId !== enterpriseId) {
        throw new InvalidOperationException('Page connection does not belong to the requesting enterprise.');
      }

      const scheduledAt = input.scheduledAt ? new Date(input.scheduledAt) : new Date(Date.now() + 24 * 60 * 60 * 1000); // default to 24h later

      const post = ScheduledPostRoot.create({
        enterpriseId,
        socialPageId: input.socialPageId,
        platformCode: socialPage.platformCode,
        content: input.content,
        mediaFileIds: input.mediaFileIds,
        scheduledAt,
        createdBy: userId,
      });

      // If scheduledAt is passed explicitly, schedule it, otherwise keep it draft
      if (input.scheduledAt) {
        post.schedule(new Date(input.scheduledAt));
      }

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
