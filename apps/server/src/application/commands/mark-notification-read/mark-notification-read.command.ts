export class MarkNotificationReadCommand {
  constructor(
    public readonly userNotificationId: string,
    public readonly userId: string,
  ) {}
}
