import { Command } from '@nestjs/cqrs';

export class CampaignParticipantHardDeleteCommand extends Command<void> {
  constructor(public readonly id: string) {
    super();
  }
}
