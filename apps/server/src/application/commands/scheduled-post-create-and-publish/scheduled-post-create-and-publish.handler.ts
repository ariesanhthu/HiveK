import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  SOCIAL_PAGE_REPOSITORY,
  type ISocialPageRepository,
  SCHEDULED_POST_REPOSITORY,
  type IScheduledPostRepository,
} from '@/core/interfaces/repositories';
import { UNIT_OF_WORK, type IUnitOfWork } from '@/application/interfaces';
import { ScheduledPostRoot } from '@/core/aggregate-roots';
import { ScheduledPostCreateAndPublishCommand } from './scheduled-post-create-and-publish.command';
import { ScheduledPostPublishCommand } from '@/application/commands';
import { ScheduledPostDto } from '@/application/dtos';
import { ScheduledPostMapper } from '@/application/mappers';
import { InvalidOperationException } from '@/core/exceptions';
import { CommandBus } from '@nestjs/cqrs';

@CommandHandler(ScheduledPostCreateAndPublishCommand)
export class ScheduledPostCreateAndPublishHandler implements ICommandHandler<ScheduledPostCreateAndPublishCommand, ScheduledPostDto> {
  constructor(
    @Inject(SOCIAL_PAGE_REPOSITORY)
    private readonly socialPageRepository: ISocialPageRepository,
    @Inject(SCHEDULED_POST_REPOSITORY)
    private readonly scheduledPostRepository: IScheduledPostRepository,
    @Inject(UNIT_OF_WORK)
    private readonly uow: IUnitOfWork,
    private readonly commandBus: CommandBus,
  ) {}

  async execute(command: ScheduledPostCreateAndPublishCommand): Promise<ScheduledPostDto> {
    const { enterpriseId, userId, input } = command;

    let postId: string;

    // 1. Create and save the post (no event emission)
    await this.uow.execute(async () => {
      const socialPage = await this.socialPageRepository.findById(input.socialPageId);
      if (!socialPage) {
        throw new Error('Social page connection not found.');
      }
      if (socialPage.enterpriseId !== enterpriseId) {
        throw new InvalidOperationException('Page connection does not belong to the requesting enterprise.');
      }

      const scheduledAt = input.scheduledAt
        ? new Date(input.scheduledAt)
        : new Date(Date.now() + 24 * 60 * 60 * 1000);

      const post = ScheduledPostRoot.create({
        enterpriseId,
        socialPageId: input.socialPageId,
        platformCode: socialPage.platformCode,
        content: input.content,
        mediaFileIds: input.mediaFileIds,
        scheduledAt,
        createdBy: userId,
      });

      if (input.scheduledAt) {
        post.schedule(new Date(input.scheduledAt));
      }

      await this.scheduledPostRepository.save(post);
      // NOTE: Intentionally skipping eventService.publishEvents — this is a test command
      postId = post.id!;
    });

    // 2. Immediately publish the post
    return this.commandBus.execute(new ScheduledPostPublishCommand(postId!));
  }
}
