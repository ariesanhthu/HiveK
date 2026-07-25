import { ScheduledPostCreateAndPublishInputDto } from './scheduled-post-create-and-publish.dto';

export class ScheduledPostCreateAndPublishCommand {
  constructor(
    public readonly enterpriseId: string,
    public readonly userId: string,
    public readonly input: ScheduledPostCreateAndPublishInputDto,
  ) {}
}
