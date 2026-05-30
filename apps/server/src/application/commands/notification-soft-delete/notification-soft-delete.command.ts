export class NotificationSoftDeleteCommand {
  constructor(
    public readonly userNotificationId: string,
    public readonly userId: string,
  ) {}
}
