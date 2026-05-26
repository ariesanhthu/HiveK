import { Command } from '@nestjs/cqrs';

export class CampaignDeleteCommand extends Command<void> {
  constructor(public readonly id: string) {
    super();
  }
}
