import { Query } from '@nestjs/cqrs';
import { SocialPageDto } from '@/application/dtos';

export class SocialPageGetListQuery extends Query<SocialPageDto[]> {
  constructor(public readonly enterpriseId: string) {
    super();
  }
}
