import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  SCHEDULED_POST_REPOSITORY,
  type IScheduledPostRepository,
} from '@/core/interfaces/repositories';
import { ScheduledPostDto } from '@/application/dtos';
import { ScheduledPostMapper } from '@/application/mappers';
import { ScheduledPostGetListQuery } from './scheduled-post-get-list.query';

@QueryHandler(ScheduledPostGetListQuery)
export class ScheduledPostGetListHandler implements IQueryHandler<
  ScheduledPostGetListQuery,
  ScheduledPostDto[]
> {
  constructor(
    @Inject(SCHEDULED_POST_REPOSITORY)
    private readonly scheduledPostRepository: IScheduledPostRepository,
  ) {}

  async execute(query: ScheduledPostGetListQuery): Promise<ScheduledPostDto[]> {
    const posts = await this.scheduledPostRepository.findByEnterpriseId(
      query.enterpriseId,
    );
    return ScheduledPostMapper.toListDto(posts);
  }
}
