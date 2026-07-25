import { Query } from '@nestjs/cqrs';
import { ScheduledPostDto } from '@/application/dtos';

export class ScheduledPostGetListQuery extends Query<ScheduledPostDto[]> {
  constructor(public readonly enterpriseId: string) {
    super();
  }
}
