import { Command } from '@nestjs/cqrs';

export class CampaignParticipantRestoreCommand extends Command<void> {
  constructor(public readonly id: string) {
    super();
  }
}
