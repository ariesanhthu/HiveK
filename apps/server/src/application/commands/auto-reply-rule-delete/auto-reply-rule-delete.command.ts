export class AutoReplyRuleDeleteCommand {
  constructor(
    public readonly ruleId: string,
    public readonly enterpriseId: string,
  ) {}
}
