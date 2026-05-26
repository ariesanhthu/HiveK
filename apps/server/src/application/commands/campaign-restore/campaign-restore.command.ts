import { Command } from '@nestjs/cqrs';

export class CampaignRestoreCommand extends Command<void> {
  constructor(public readonly id: string) {
    super();
  }
}
