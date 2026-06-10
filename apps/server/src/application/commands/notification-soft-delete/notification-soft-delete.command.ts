export class NotificationSoftDeleteCommand {
  constructor(
    public readonly ids: string[],
    public readonly userId: string,
  ) {}
}
