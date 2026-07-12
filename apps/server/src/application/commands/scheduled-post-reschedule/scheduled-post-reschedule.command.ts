export class ScheduledPostRescheduleCommand {
  constructor(
    public readonly postId: string,
    public readonly enterpriseId: string,
    public readonly scheduledAt: Date,
  ) {}
}
