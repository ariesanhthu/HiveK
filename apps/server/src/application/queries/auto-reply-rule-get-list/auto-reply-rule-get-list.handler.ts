import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  AUTO_REPLY_RULE_REPOSITORY,
  type IAutoReplyRuleRepository,
  SOCIAL_PAGE_REPOSITORY,
  type ISocialPageRepository,
} from '@/core/interfaces/repositories';
import { AutoReplyRuleDto } from '@/application/dtos';
import { AutoReplyRuleMapper } from '@/application/mappers';
import { AutoReplyRuleGetListQuery } from './auto-reply-rule-get-list.query';
import { InvalidOperationException } from '@/core/exceptions';

@QueryHandler(AutoReplyRuleGetListQuery)
export class AutoReplyRuleGetListHandler implements IQueryHandler<AutoReplyRuleGetListQuery, AutoReplyRuleDto[]> {
  constructor(
    @Inject(AUTO_REPLY_RULE_REPOSITORY)
    private readonly autoReplyRuleRepository: IAutoReplyRuleRepository,
    @Inject(SOCIAL_PAGE_REPOSITORY)
    private readonly socialPageRepository: ISocialPageRepository,
  ) {}

  async execute(query: AutoReplyRuleGetListQuery): Promise<AutoReplyRuleDto[]> {
    const page = await this.socialPageRepository.findById(query.socialPageId);
    if (!page) {
      throw new Error('Social page connection not found.');
    }
    if (page.enterpriseId !== query.enterpriseId) {
      throw new InvalidOperationException('Unauthorized enterprise access to rule details.');
    }

    const rules = await this.autoReplyRuleRepository.findByPageId(query.socialPageId);
    return AutoReplyRuleMapper.toListDto(rules);
  }
}
