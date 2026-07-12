import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  SCHEDULED_POST_REPOSITORY,
  type IScheduledPostRepository,
  SOCIAL_PAGE_REPOSITORY,
  type ISocialPageRepository,
  UPLOADED_FILE_REPOSITORY,
  type IUploadedFileRepository,
} from '@/core/interfaces/repositories';
import {
  EVENT_SERVICE,
  type IEventService,
  UNIT_OF_WORK,
  type IUnitOfWork,
} from '@/application/interfaces';
import {
  SOCIAL_PUBLISHER_DISCOVERY,
  type ISocialPublisherDiscovery,
} from '@/core/interfaces';
import { ScheduledPostPublishCommand } from './scheduled-post-publish.command';
import { ScheduledPostDto } from '@/application/dtos';
import { ScheduledPostMapper } from '@/application/mappers';

@CommandHandler(ScheduledPostPublishCommand)
export class ScheduledPostPublishHandler implements ICommandHandler<ScheduledPostPublishCommand, ScheduledPostDto> {
  constructor(
    @Inject(SCHEDULED_POST_REPOSITORY)
    private readonly scheduledPostRepository: IScheduledPostRepository,
    @Inject(SOCIAL_PAGE_REPOSITORY)
    private readonly socialPageRepository: ISocialPageRepository,
    @Inject(UPLOADED_FILE_REPOSITORY)
    private readonly uploadedFileRepository: IUploadedFileRepository,
    @Inject(SOCIAL_PUBLISHER_DISCOVERY)
    private readonly socialPublisherDiscovery: ISocialPublisherDiscovery,
    @Inject(EVENT_SERVICE)
    private readonly eventService: IEventService,
    @Inject(UNIT_OF_WORK)
    private readonly uow: IUnitOfWork,
  ) {}

  async execute(command: ScheduledPostPublishCommand): Promise<ScheduledPostDto> {
    // 1. Mark as publishing first to prevent double-processing
    await this.uow.startTransaction();
    let post = await this.scheduledPostRepository.findById(command.postId);
    if (!post) {
      await this.uow.rollbackTransaction();
      throw new Error('Scheduled post not found.');
    }

    try {
      post.markPublishing();
      await this.scheduledPostRepository.save(post);
      await this.uow.commitTransaction();
    } catch (error) {
      await this.uow.rollbackTransaction();
      throw error;
    }

    // 2. Fetch the SocialPage
    const socialPage = await this.socialPageRepository.findById(post.socialPageId);
    if (!socialPage) {
      await this.uow.startTransaction();
      post.markFailed('Social page connection not found.');
      await this.scheduledPostRepository.save(post);
      await this.uow.commitTransaction();
      return ScheduledPostMapper.toDto(post);
    }

    // 3. Resolve media file URLs
    const mediaUrls: string[] = [];
    for (const fileId of post.mediaFileIds) {
      const file = await this.uploadedFileRepository.findById(fileId);
      if (file) {
        mediaUrls.push(file.url);
      }
    }

    // 4. Publish to external platform
    try {
      const publisher = this.socialPublisherDiscovery.findByCode(socialPage.platformCode);
      const result = await publisher.publishPost({
        pageToken: socialPage.encryptedToken, // Plain access token in core
        pageId: socialPage.pageId,
        content: post.content,
        mediaUrls,
      });

      await this.uow.startTransaction();
      post.markPublished(result.platformPostId);
      await this.scheduledPostRepository.save(post);
      await this.eventService.publishEvents(post);
      await this.uow.commitTransaction();
    } catch (err: any) {
      await this.uow.startTransaction();
      post.markFailed(err.message || 'Publishing failed.');
      await this.scheduledPostRepository.save(post);
      await this.eventService.publishEvents(post);
      await this.uow.commitTransaction();
    }

    return ScheduledPostMapper.toDto(post);
  }
}
