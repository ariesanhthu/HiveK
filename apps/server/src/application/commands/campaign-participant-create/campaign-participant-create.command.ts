import { Command } from '@nestjs/cqrs';
import { CampaignParticipantCreateInputDto } from './campaign-participant-create.dto';

export class CampaignParticipantCreateCommand extends Command<string> {
  constructor(public readonly input: CampaignParticipantCreateInputDto) {
    super();
  }
}
