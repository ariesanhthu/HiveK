export class ScheduledPostCancelCommand {
  constructor(
    public readonly postId: string,
    public readonly enterpriseId: string,
  ) {}
}
