import { Command } from '@nestjs/cqrs';
import { CampaignParticipantUpdateInputDto } from './campaign-participant-update.dto';

export class CampaignParticipantUpdateCommand extends Command<void> {
  constructor(
    public readonly id: string,
    public readonly input: CampaignParticipantUpdateInputDto,
  ) {
    super();
  }
}
