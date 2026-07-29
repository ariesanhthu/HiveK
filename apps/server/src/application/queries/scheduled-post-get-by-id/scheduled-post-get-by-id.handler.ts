import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  SCHEDULED_POST_REPOSITORY,
  type IScheduledPostRepository,
} from '@/core/interfaces/repositories';
import { ScheduledPostDto } from '@/application/dtos';
import { ScheduledPostMapper } from '@/application/mappers';
import { ScheduledPostGetByIdQuery } from './scheduled-post-get-by-id.query';
import { InvalidOperationException } from '@/core/exceptions';

@QueryHandler(ScheduledPostGetByIdQuery)
export class ScheduledPostGetByIdHandler implements IQueryHandler<
  ScheduledPostGetByIdQuery,
  ScheduledPostDto
> {
  constructor(
    @Inject(SCHEDULED_POST_REPOSITORY)
    private readonly scheduledPostRepository: IScheduledPostRepository,
  ) {}

  async execute(query: ScheduledPostGetByIdQuery): Promise<ScheduledPostDto> {
    const post = await this.scheduledPostRepository.findById(query.postId);
    if (!post) {
      throw new Error('Scheduled post not found.');
    }
    if (post.enterpriseId !== query.enterpriseId) {
      throw new InvalidOperationException(
        'Unauthorized enterprise access to post.',
      );
    }
    return ScheduledPostMapper.toDto(post);
  }
}
