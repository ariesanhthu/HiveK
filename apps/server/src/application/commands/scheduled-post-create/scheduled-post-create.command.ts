import { ScheduledPostCreateInputDto } from './scheduled-post-create.dto';

export class ScheduledPostCreateCommand {
  constructor(
    public readonly enterpriseId: string,
    public readonly userId: string,
    public readonly input: ScheduledPostCreateInputDto,
  ) {}
}
