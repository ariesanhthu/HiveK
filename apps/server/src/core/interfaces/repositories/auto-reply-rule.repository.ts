import { IBaseRepository } from '../../common';
import { AutoReplyRuleRoot } from '../../aggregate-roots/auto-reply-rule.aggregate';

export interface IAutoReplyRuleRepository extends IBaseRepository<AutoReplyRuleRoot> {
  findActiveByPageId(socialPageId: string): Promise<AutoReplyRuleRoot[]>;
  findByPageId(socialPageId: string): Promise<AutoReplyRuleRoot[]>;
}

export const AUTO_REPLY_RULE_REPOSITORY = Symbol('IAutoReplyRuleRepository');
