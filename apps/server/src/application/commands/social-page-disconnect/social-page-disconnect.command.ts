export class SocialPageDisconnectCommand {
  constructor(
    public readonly socialPageId: string,
    public readonly enterpriseId: string,
    public readonly userId: string,
  ) {}
}
