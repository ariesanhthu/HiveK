import { Command } from '@nestjs/cqrs';

export class CampaignSoftDeleteCommand extends Command<void> {
  constructor(
    public readonly id: string,
    public readonly requestedBy: string,
    public readonly deletedBy: string = 'system',
  ) {
    super();
  }
}
