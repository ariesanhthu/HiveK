import { Query } from '@nestjs/cqrs';
import { AutoReplyRuleDto } from '@/application/dtos';

export class AutoReplyRuleGetListQuery extends Query<AutoReplyRuleDto[]> {
  constructor(
    public readonly socialPageId: string,
    public readonly enterpriseId: string,
  ) {
    super();
  }
}
