import { Query } from '@nestjs/cqrs';
import { ScheduledPostDto } from '@/application/dtos';

export class ScheduledPostGetByIdQuery extends Query<ScheduledPostDto> {
  constructor(
    public readonly postId: string,
    public readonly enterpriseId: string,
  ) {
    super();
  }
}
