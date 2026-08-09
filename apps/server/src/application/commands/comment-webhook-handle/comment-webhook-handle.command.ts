export class CommentWebhookHandleCommand {
  constructor(
    public readonly platformCode: string,
    public readonly payload: Record<string, unknown>,
  ) {}
}
