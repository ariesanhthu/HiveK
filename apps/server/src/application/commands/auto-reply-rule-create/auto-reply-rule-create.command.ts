import { AutoReplyRuleCreateInputDto } from './auto-reply-rule-create.dto';

export class AutoReplyRuleCreateCommand {
  constructor(
    public readonly enterpriseId: string,
    public readonly input: AutoReplyRuleCreateInputDto,
  ) {}
}
