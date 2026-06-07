export class NotificationHardDeleteCommand {
  constructor(
    public readonly ids: string[],
    public readonly userId: string,
  ) {}
}
