export class NotificationUpdateReadStatusCommand {
  constructor(
    public readonly userId: string,
    public readonly isRead: boolean,
    public readonly ids?: string[],
  ) {}
}
