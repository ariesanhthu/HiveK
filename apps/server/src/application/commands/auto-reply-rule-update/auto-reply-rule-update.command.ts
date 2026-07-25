import { AutoReplyRuleUpdateInputDto } from './auto-reply-rule-update.dto';

export class AutoReplyRuleUpdateCommand {
  constructor(
    public readonly ruleId: string,
    public readonly enterpriseId: string,
    public readonly input: AutoReplyRuleUpdateInputDto,
  ) {}
}
