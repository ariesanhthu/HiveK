export class NotificationRestoreCommand {
  constructor(
    public readonly ids: string[],
    public readonly userId: string,
  ) {}
}
